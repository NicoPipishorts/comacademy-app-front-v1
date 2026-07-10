import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import {
	colorGrey,
	primaryBackground,
} from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SkeletonBlock from "./SkeletonBlock";

type FeedSkeletonProps = {
	items?: number;
};

export default function FeedSkeleton({ items = 4 }: FeedSkeletonProps) {
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.wrapper}>
			<View style={styles.scrollContent}>
				<PageTitleAvatarHeader
					title='Feed'
					containerStyle={[
						styles.headerWrapper,
						{
							paddingTop: insets.top,
						},
					]}
				/>

				{Array.from({ length: items }).map((_, index) => (
					<View key={`feed-skeleton-${index}`} style={styles.feedWrapper}>
						<View style={styles.headerRow}>
							<SkeletonBlock style={styles.iconSkeleton} />
							<View style={styles.headerTextContainer}>
								<View style={styles.headerTopRow}>
									<SkeletonBlock style={styles.titleSkeleton} />
									<SkeletonBlock style={styles.timeSkeleton} />
								</View>
								<SkeletonBlock style={styles.subTitleSkeleton} />
							</View>
						</View>

						<View style={styles.cardWrapper}>
							<SkeletonBlock style={styles.mediaSkeleton} />
						</View>

						<View style={styles.footerRow}>
							<SkeletonBlock style={styles.footerIconSkeleton} />
							<SkeletonBlock style={styles.footerCountSkeleton} />
						</View>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	scrollContent: {
		paddingBottom: 120,
		paddingHorizontal: 24,
	},
	headerWrapper: {
		paddingHorizontal: 0,
	},
	feedWrapper: {
		width: "100%",
		borderBottomWidth: 1,
		borderBottomColor: colorGrey,
		paddingVertical: 30,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		width: "100%",
	},
	iconSkeleton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 10,
	},
	headerTextContainer: {
		flex: 1,
	},
	headerTopRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingRight: 10,
		marginBottom: 8,
	},
	titleSkeleton: {
		width: "48%",
		height: 22,
	},
	timeSkeleton: {
		width: 70,
		height: 16,
	},
	subTitleSkeleton: {
		width: "58%",
		height: 16,
	},
	cardWrapper: {
		flexShrink: 0,
		alignItems: "center",
		marginTop: 20,
		borderLeftColor: "#707070",
		borderLeftWidth: 1,
		marginLeft: 23,
	},
	mediaSkeleton: {
		width: "100%",
		height: 280,
		borderRadius: 22,
		marginLeft: 24,
	},
	footerRow: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
		minWidth: "100%",
		marginTop: 20,
	},
	footerIconSkeleton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginLeft: 8,
		marginRight: 20,
	},
	footerCountSkeleton: {
		width: 26,
		height: 18,
	},
});
