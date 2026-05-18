import { colorBlack } from "@/constants/colors";
import { FontSizeH1 } from "@/constants/fontsizes";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ParcoursStepCounter({
	currentIndex,
	totalSteps,
	accentColor,
}: {
	currentIndex: number;
	totalSteps: number;
	accentColor: string;
}) {
	const safeTotal = Math.max(totalSteps, 1);
	const safeCurrent = Math.min(currentIndex + 1, safeTotal);

	return (
		<View style={styles.counterBlock}>
			<Text style={styles.counterText}>
				{safeCurrent}/{safeTotal}
			</Text>
			<View style={styles.counterTrack}>
				<View
					style={[
						styles.counterFill,
						{ backgroundColor: accentColor },
						{ width: `${(safeCurrent / safeTotal) * 100}%` },
					]}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	counterBlock: {
		marginBottom: 22,
	},
	counterText: {
		fontSize: FontSizeH1,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 10,
	},
	counterTrack: {
		height: 4,
		borderRadius: 999,
		backgroundColor: "#F0D6E6",
		overflow: "hidden",
	},
	counterFill: {
		height: "100%",
		borderRadius: 999,
	},
});
