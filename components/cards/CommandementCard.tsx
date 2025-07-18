// File: src/components/cards/CommandementCard.tsx
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface Props {
	title: string;
	text: string;
	cardWidth: number;
	cardMargin: number;
	index: number;
}

export default function CommandementCard({
	title,
	text,
	cardWidth,
	cardMargin,
	index,
}: Props) {
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
				<Text style={styles.tinyTitle}>Tips and Tactic – {index}</Text>
				<Text style={styles.keyCardTitle}>{title} :</Text>

				<View style={styles.cardContent}>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false} // <– hide the scrollbar
					>
						<Text style={styles.keyCardText}>{text}</Text>
					</ScrollView>
				</View>
			</LinearGradient>
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
		paddingTop: 30,
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
		flex: 1, // take up remaining space
		marginTop: 20,
		overflow: "hidden",
	},
	scrollContent: {
		paddingBottom: 20, // so last lines aren’t cut off
	},
	keyCardText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
		lineHeight: 22,
	},
});
