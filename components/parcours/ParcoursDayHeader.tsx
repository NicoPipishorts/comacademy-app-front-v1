import { colorBlack } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import ParcoursStepCounter from "./ParcoursStepCounter";

export default function ParcoursDayHeader({
	dateLabel,
	stepTitle,
	stepSubtitle,
	currentIndex,
	totalSteps,
	accentColor,
	trailing,
}: {
	dateLabel: string;
	stepTitle: string;
	stepSubtitle?: string | null;
	currentIndex: number;
	totalSteps: number;
	accentColor: string;
	trailing?: ReactNode;
}) {
	return (
		<View
			style={[
				styles.topMeta,
				stepSubtitle && styles.topMetaWithSubtitle,
				trailing && styles.topMetaWithTrailing,
			]}>
			<Text style={[styles.dateLabel, trailing && styles.dateLabelWithTrailing]}>
				{dateLabel}
			</Text>
			{trailing ? <View style={styles.trailingWrap}>{trailing}</View> : null}
			<ParcoursStepCounter
				currentIndex={currentIndex}
				totalSteps={totalSteps}
				accentColor={accentColor}
				stepTitle={stepTitle}
				stepSubtitle={stepSubtitle}
				hasTrailing={Boolean(trailing)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	dateLabel: {
		fontSize: FontSize16,
		fontWeight: "600",
		color: colorBlack,
		marginBottom: 6,
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
	topMetaWithSubtitle: {
		marginBottom: -6,
	},
	trailingWrap: {
		position: "absolute",
		top: 0,
		right: 0,
	},
});
