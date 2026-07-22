import endImage from "@/assets/imgs/parcours/OnboardingPages/end.png";
import CelebrationConfetti from "@/components/experience/CelebrationConfetti";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { getParcoursQuizIconForProgramOrder } from "@/helpers/parcours/icons";
import React from "react";
import {
	Image,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function ParcoursDayCompletionScreen({
	dateLabel,
	weekProgramOrder,
	onReturn,
}: {
	dateLabel: string;
	weekProgramOrder?: number | null;
	onReturn: () => void;
}) {
	const { height, width } = useWindowDimensions();
	const mountainSize = Math.min(Math.max(height * 0.37, 300), 390);
	const mountainOffsetY = mountainSize * (-62.5 / 456);
	const titleFontSize = Math.min(56, Math.max(42, width * 0.14));

	return (
		<Animated.View entering={FadeIn.duration(450)} style={styles.wrapper}>
			<View style={styles.topBlock}>
				<Text style={styles.dateLabel}>{dateLabel}</Text>
				<Image
					source={getParcoursQuizIconForProgramOrder(weekProgramOrder)}
					resizeMode='contain'
					style={styles.parcoursIcon}
				/>
				<Text
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={1}
					style={[styles.title, { fontSize: titleFontSize }]}>
					Bravo !
				</Text>
			</View>

			<View style={styles.mountainWrap}>
				<Animated.Image
					source={endImage}
					resizeMode='contain'
					entering={FadeIn.duration(600).delay(80)}
					style={{
						width: mountainSize,
						height: mountainSize,
						transform: [{ translateY: mountainOffsetY }],
					}}
				/>
			</View>

			<CelebrationConfetti />

			<View style={styles.bottomBlock}>
				<Text style={styles.missionTitle}>
					Mission du jour{"\n"}Accomplie !
				</Text>
				<Text style={styles.supportText}>
					A demain pour{"\n"}continuer l&apos;ascension
				</Text>
				<Pressable onPress={onReturn} style={styles.returnButton}>
					<Text style={styles.returnButtonText}>Retour au Parcours</Text>
				</Pressable>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		position: "relative",
		backgroundColor: "#F7F7F7",
		alignItems: "center",
	},
	topBlock: {
		position: "absolute",
		top: 30,
		left: 24,
		right: 24,
		alignItems: "center",
	},
	dateLabel: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 20,
	},
	parcoursIcon: {
		marginTop: -30,
		width: 278,
		height: 278,
		marginRight: -40
	},
	title: {
		marginTop: -80,
		fontWeight: "900",
		color: colorBlack,
		textAlign: "center",
		width: "100%",
	},
	mountainWrap: {
		position: "absolute",
		top: 280,
		bottom: 250,
		left: 0,
		right: 0,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	bottomBlock: {
		position: "absolute",
		left: 30,
		right: 30,
		bottom: 54,
		alignItems: "center",
	},
	missionTitle: {
		fontSize: 32,
		lineHeight: 34,
		fontWeight: "900",
		color: colorBlack,
		textAlign: "center",
		marginBottom: 8,
	},
	supportText: {
		fontSize: 19,
		lineHeight: 21,
		fontWeight: "700",
		color: colorBlack,
		textAlign: "center",
		marginBottom: 28,
	},
	returnButton: {
		width: "100%",
		maxWidth: 342,
		height: 64,
		borderRadius: 14,
		backgroundColor: "#272727",
		alignItems: "center",
		justifyContent: "center",
	},
	returnButtonText: {
		fontSize: 20,
		fontWeight: "900",
		color: colorWhite,
	},
});
