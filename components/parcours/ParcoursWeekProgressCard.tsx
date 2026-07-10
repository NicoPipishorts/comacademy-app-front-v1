import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
	colorBlack,
	colorGreen,
	colorWhite,
} from "@/constants/colors";
import {
	FontSize12,
	FontSizeH2,
} from "@/constants/fontsizes";
import { ParcoursWeekDetail } from "@/types/parcours";
import {
	formatParcoursWeekProgressLabel,
	getParcoursWeekProgressRatio,
} from "@/helpers/parcours/week";

export default function ParcoursWeekProgressCard({
	week,
}: {
	week: ParcoursWeekDetail;
}) {
	const progressRatio = getParcoursWeekProgressRatio(week);

	return (
		<View style={styles.progressCard}>
			<Text style={styles.progressTitle}>
				{week.weekLabel || `Semaine ${week.programOrder}`}
			</Text>
			<Text style={styles.progressMeta}>{formatParcoursWeekProgressLabel(week)}</Text>
			<View style={styles.progressTrack}>
				<View
					style={[
						styles.progressFill,
						{ width: `${Math.max(progressRatio * 100, 3)}%` },
					]}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	progressCard: {
		backgroundColor: colorBlack,
		borderRadius: 22,
		padding: 14,
		marginTop: 8,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 16 },
		shadowOpacity: 0.12,
		shadowRadius: 24,
		elevation: 3,
	},
	progressTitle: {
		fontSize: FontSizeH2,
		fontWeight: "800",
		color: colorWhite,
		marginBottom: 20,
	},
	progressMeta: {
		fontSize: FontSize12,
		fontWeight: "700",
		color: colorWhite,
		marginBottom: 12,
		opacity: 0.9,
	},
	progressTrack: {
		height: 14,
		borderRadius: 999,
		backgroundColor: colorWhite,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: 999,
		backgroundColor: colorGreen,
	},
});
