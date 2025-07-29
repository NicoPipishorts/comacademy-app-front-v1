// File: src/components/cards/CommandementCard.tsx
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
	Alert,
	Linking,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface Props {
	title: string;
	text: string;
	cardWidth: number;
	cardMargin: number;
	cta: string; // URL or host
	index: number;
}

export default function CommandementCard({
	title,
	text,
	cardWidth,
	cardMargin,
	cta,
	index,
}: Props) {
	const handlePress = async () => {
		// ensure the URL has a scheme
		const url =
			cta.startsWith("http://") || cta.startsWith("https://")
				? cta
				: `https://${cta}`;

		try {
			const supported = await Linking.canOpenURL(url);
			if (supported) {
				await Linking.openURL(url);
			} else {
				Alert.alert("Invalid URL", `Can't open this link: ${url}`);
			}
		} catch (err) {
			console.error("Error opening URL:", err);
			Alert.alert(
				"Error",
				"Something went wrong when trying to open the link."
			);
		}
	};

	// derive the display text by extracting only the root domain
	const displayText = (() => {
		// 1) strip protocol
		const withoutProto = cta.replace(/^https?:\/\//i, "");
		// 2) cut off path or query
		const hostOnly = withoutProto.split(/[\/\?]/)[0];
		// 3) take only the last two segments of the host
		const parts = hostOnly.split(".");
		if (parts.length >= 2) {
			return parts.slice(-2).join(".");
		}
		return hostOnly;
	})();

	return (
		<View style={styles.wrapper}>
			<LinearGradient
				colors={["#368FC9", "#79FC7E"]}
				style={[
					styles.keyCardWrapper,
					{ width: cardWidth, marginHorizontal: cardMargin },
				]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}>
				<Text style={styles.tinyTitle}>Tips and Tactics – {index}</Text>
				<Text style={styles.keyCardTitle}>{title} :</Text>

				<View style={styles.cardContent}>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}>
						<Text style={styles.keyCardText}>{text}</Text>
					</ScrollView>
				</View>
			</LinearGradient>

			{cta && (
				<TouchableOpacity style={styles.cta} onPress={handlePress}>
					<Text style={styles.ctaText}>{displayText}</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		justifyContent: "center",
		alignItems: "center",
		minHeight: "100%",
	},
	keyCardWrapper: {
		position: "relative",
		justifyContent: "flex-start",
		height: 500,
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingTop: 20,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
	},
	tinyTitle: {
		color: colorWhite,
		fontSize: FontSize14,
		fontWeight: "bold",
		marginBottom: 10,
	},
	keyCardTitle: {
		color: colorWhite,
		fontSize: FontSizeH1,
		fontWeight: "bold",
	},
	cardContent: {
		flex: 1,
		marginTop: 20,
		overflow: "hidden",
	},
	scrollContent: {
		paddingBottom: 20,
	},
	keyCardText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
		lineHeight: 22,
	},
	cta: {
		marginTop: 16,
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
	ctaText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
		lineHeight: 22,
	},
});
