import {
	colorPink,
	colorTurquoise,
	colorWhite,
	colorYellow,
} from "@/constants/colors";
import { FontSize18, FontSize22, FontSizeH1, FontSizeScreenTitles } from "@/constants/fontsizes";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CannonConfetti } from "react-native-fast-confetti";

export default function ParcoursDayCompletionCelebration() {
	return (
		<View style={styles.overlay} pointerEvents='none'>
			<BlurView intensity={42} tint='dark' style={StyleSheet.absoluteFillObject} />
			<View style={styles.scrim} />
			<CannonConfetti
				autoplay
				gravity={3}
				fadeOutOnEnd
				containerStyle={styles.confettiLayer}
				colors={[colorPink, colorYellow, colorTurquoise]}>
				<CannonConfetti.Origin position='bottom-left' count={120} initialSpeed={2.8} />
				<CannonConfetti.Origin position='bottom-right' count={120} initialSpeed={2.8} />
				<CannonConfetti.Flake size={12} radius={6} />
				<CannonConfetti.Flake width={8} height={14} radius={3} />
			</CannonConfetti>
			<View style={styles.messageCard}>
				<Text style={styles.title}>Bravo !</Text>
				<Text style={styles.body}>Le parcours du jour est fini.</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 20,
	},
	scrim: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.83)",
	},
	confettiLayer: {
		...StyleSheet.absoluteFillObject,
	},
	messageCard: {
		paddingHorizontal: 28,
		paddingVertical: 22,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "800",
		color: colorWhite,
		marginBottom: 10,
		textAlign: "center",
	},
	body: {
		fontSize: FontSize22,
		fontWeight: "700",
		color: colorWhite,
		textAlign: "center",
	},
});
