import { colorBlack } from "@/constants/colors";
import { FontSize14, FontSize20 } from "@/constants/fontsizes";
import { mixParcoursColorWithWhite } from "@/helpers/parcours/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ParcoursStepCounter({
	currentIndex,
	totalSteps,
	accentColor,
	stepTitle,
	stepSubtitle,
	hasTrailing = false,
}: {
	currentIndex: number;
	totalSteps: number;
	accentColor: string;
	stepTitle: string;
	stepSubtitle?: string | null;
	hasTrailing?: boolean;
}) {
	const safeTotal = Math.max(totalSteps, 1);
	const safeCurrent = Math.min(currentIndex + 1, safeTotal);
	const trackColor = mixParcoursColorWithWhite(accentColor, 0.82);

	return (
		<View
			style={[
				styles.counterBlock,
				stepSubtitle && styles.counterBlockWithSubtitle,
			]}>
			<Text
				style={[
					styles.counterText,
					hasTrailing && styles.counterTextWithTrailing,
				]}>
				<Text style={styles.counterNumber}>
					{safeCurrent}/{safeTotal}
				</Text>
				{` - ${stepTitle}`}
			</Text>
			<View style={[styles.counterTrack, { backgroundColor: trackColor }]}>
				<View
					style={[
						styles.counterFill,
						{ backgroundColor: accentColor },
						{ width: `${(safeCurrent / safeTotal) * 100}%` },
					]}
				/>
			</View>
			{stepSubtitle ? (
				<Text style={styles.stepSubtitle}>{stepSubtitle}</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	counterBlock: {
		marginBottom: 22,
		marginTop: 12,
	},
	counterBlockWithSubtitle: {
		marginBottom: 0,
	},
	counterText: {
		fontSize: FontSize20,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 10,
	},
	counterTextWithTrailing: {
		paddingRight: 96,
	},
	counterNumber: {
		fontVariant: ["tabular-nums"],
	},
	counterTrack: {
		height: 4,
		borderRadius: 999,
		overflow: "hidden",
	},
	counterFill: {
		height: "100%",
		borderRadius: 999,
	},
	stepSubtitle: {
		fontSize: FontSize14,
		lineHeight: 20,
		fontWeight: "700",
		color: colorBlack,
		marginTop: 24,
		paddingLeft: 16,
	},
});
