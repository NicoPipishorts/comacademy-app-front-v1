import ReturnButton from "@/components/buttons/returnButton";
import { primaryBackground } from "@/constants/colors";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SkeletonBlock from "./SkeletonBlock";

export default function PlaylistDetailsSkeleton() {
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.wrapper}>
			<ReturnButton />

			<SkeletonBlock
				style={{
					position: "absolute",
					top: insets.top + 15,
					right: 30,
					width: 25,
					height: 25,
					borderRadius: 8,
				}}
			/>

			<View style={styles.headerContainer}>
				<SkeletonBlock style={styles.coverSkeleton} />
				<View style={styles.headerTextContainer}>
					<Text style={styles.staticLabel}>Playlist</Text>
					<SkeletonBlock style={styles.titleSkeleton} />
					<SkeletonBlock style={styles.countSkeleton} />
				</View>
			</View>

			<View style={styles.contentContainer}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}>
					{Array.from({ length: 6 }).map((_, index) => (
						<View key={`playlist-content-skeleton-${index}`} style={styles.itemRow}>
							<SkeletonBlock style={styles.itemImageSkeleton} />
							<View style={styles.itemTextGroup}>
								<SkeletonBlock style={styles.itemGroupSkeleton} />
								<SkeletonBlock style={styles.itemValueSkeleton} />
								<SkeletonBlock style={styles.itemValueShortSkeleton} />
							</View>
						</View>
					))}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 40,
		backgroundColor: primaryBackground,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 30,
	},
	coverSkeleton: {
		width: 100,
		height: 100,
		borderRadius: 24,
	},
	headerTextContainer: {
		marginLeft: 16,
		flex: 1,
	},
	staticLabel: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 8,
	},
	titleSkeleton: {
		width: 160,
		height: 30,
		marginBottom: 10,
	},
	countSkeleton: {
		width: 90,
		height: 14,
	},
	contentContainer: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: 50,
		paddingBottom: 30,
		minWidth: "100%",
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 22,
	},
	itemImageSkeleton: {
		width: 70,
		height: 70,
		borderRadius: 18,
	},
	itemTextGroup: {
		marginLeft: 16,
		flex: 1,
	},
	itemGroupSkeleton: {
		width: 90,
		height: 20,
		marginBottom: 8,
	},
	itemValueSkeleton: {
		width: "92%",
		height: 14,
		marginBottom: 6,
	},
	itemValueShortSkeleton: {
		width: "70%",
		height: 14,
	},
});
