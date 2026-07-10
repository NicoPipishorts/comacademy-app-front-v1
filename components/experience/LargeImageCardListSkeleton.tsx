import SkeletonBlock from "@/components/experience/SkeletonBlock";
import { colorBlack, colorWhite } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";

type LargeImageCardListSkeletonProps = {
	cardCount?: number;
	horizontalPadding?: number;
	includeTopSpacing?: boolean;
};

export default function LargeImageCardListSkeleton({
	cardCount = 3,
	horizontalPadding = 20,
	includeTopSpacing = true,
}: LargeImageCardListSkeletonProps) {
	return (
		<View
			style={[
				styles.container,
				includeTopSpacing && styles.containerWithTopSpacing,
				{ paddingHorizontal: horizontalPadding },
			]}>
			{Array.from({ length: cardCount }).map((_, index) => (
				<View key={index} style={styles.cardWrapper}>
					<View style={styles.card}>
						<SkeletonBlock style={styles.imageArea} />
						<View style={styles.contentBand}>
							<View style={styles.textGroup}>
								<SkeletonBlock style={styles.titleLinePrimary} />
								<SkeletonBlock style={styles.titleLineSecondary} />
							</View>
							<View style={styles.buttonShell}>
								<SkeletonBlock style={styles.buttonLine} />
							</View>
						</View>
					</View>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingBottom: 100,
	},
	containerWithTopSpacing: {
		paddingTop: 10,
	},
	cardWrapper: {
		marginVertical: 20,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 10.84,
	},
	card: {
		borderRadius: 25,
		overflow: "hidden",
		backgroundColor: colorWhite,
	},
	imageArea: {
		height: 205,
		borderRadius: 0,
	},
	contentBand: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 20,
		backgroundColor: colorWhite,
	},
	textGroup: {
		flex: 1,
		paddingRight: 16,
	},
	titleLinePrimary: {
		height: 22,
		width: "78%",
		borderRadius: 8,
		marginBottom: 10,
	},
	titleLineSecondary: {
		height: 22,
		width: "52%",
		borderRadius: 8,
	},
	buttonShell: {
		minWidth: 78,
		height: 40,
		paddingHorizontal: 18,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colorBlack,
	},
	buttonLine: {
		width: 28,
		height: 12,
		borderRadius: 6,
		backgroundColor: "rgba(255,255,255,0.28)",
	},
});
