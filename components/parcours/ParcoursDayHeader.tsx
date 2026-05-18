import { colorBlack } from "@/constants/colors";
import { FontSize18 } from "@/constants/fontsizes";
import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import ParcoursStepCounter from "./ParcoursStepCounter";

export default function ParcoursDayHeader({
	dateLabel,
	currentIndex,
	totalSteps,
	accentColor,
	trailing,
}: {
	dateLabel: string;
	currentIndex: number;
	totalSteps: number;
	accentColor: string;
	trailing?: ReactNode;
}) {
	return (
		<View style={[styles.topMeta, trailing && styles.topMetaWithTrailing]}>
			<Text style={[styles.dateLabel, trailing && styles.dateLabelWithTrailing]}>
				{dateLabel}
			</Text>
			{trailing ? <View style={styles.trailingWrap}>{trailing}</View> : null}
			<ParcoursStepCounter
				currentIndex={currentIndex}
				totalSteps={totalSteps}
				accentColor={accentColor}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	dateLabel: {
		fontSize: FontSize18,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 14,
	},
	dateLabelWithTrailing: {
		paddingRight: 96,
	},
	topMeta: {
		paddingTop: 2,
		marginBottom: 18,
		position: "relative",
	},
	topMetaWithTrailing: {
		minHeight: 88,
	},
	trailingWrap: {
		position: "absolute",
		top: 0,
		right: 0,
	},
});
