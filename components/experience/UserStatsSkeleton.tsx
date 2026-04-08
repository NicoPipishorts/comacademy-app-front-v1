import { colorBlack, colorWhite } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";

import SkeletonBlock from "./SkeletonBlock";

export default function UserStatsSkeleton() {
	return (
		<View style={styles.wrapper}>
			<View style={styles.pointsCard}>
				<SkeletonBlock style={styles.pointsValue} />
				<SkeletonBlock style={styles.pointsLabel} />
			</View>

			{Array.from({ length: 6 }).map((_, index) => (
				<View key={`stats-skeleton-${index}`} style={styles.row}>
					<SkeletonBlock style={styles.rowLabel} />
					<View style={styles.progressTrack}>
						<SkeletonBlock style={styles.progressFill} />
					</View>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 20,
	},
	pointsCard: {
		borderRadius: 24,
		backgroundColor: colorBlack,
		paddingHorizontal: 24,
		paddingVertical: 26,
		marginBottom: 28,
	},
	pointsValue: {
		width: 120,
		height: 40,
		backgroundColor: "rgba(255,255,255,0.22)",
		marginBottom: 12,
	},
	pointsLabel: {
		width: 82,
		height: 16,
		backgroundColor: "rgba(255,255,255,0.18)",
	},
	row: {
		marginBottom: 18,
	},
	rowLabel: {
		width: 110,
		height: 18,
		marginBottom: 10,
	},
	progressTrack: {
		height: 16,
		borderRadius: 999,
		backgroundColor: colorWhite,
		overflow: "hidden",
	},
	progressFill: {
		width: "56%",
		height: "100%",
		borderRadius: 999,
	},
});
