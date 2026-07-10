import FloatingTabBar from "@/components/FloatingTabBar";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { colorGrey, primaryBackground } from "@/constants/colors";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SkeletonBlock from "./SkeletonBlock";

export default function LeaderBoardSkeleton() {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.wrapper,
				{
					paddingTop: insets.top,
					paddingBottom: insets.bottom + 24,
				},
			]}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={styles.scrollView}
				contentContainerStyle={styles.content}>
				<PageTitleAvatarHeader title='Classement' />
				{Array.from({ length: 8 }).map((_, index) => (
					<View key={`leaderboard-skeleton-${index}`} style={styles.rowWrapper}>
						<View style={styles.resultRow}>
							<View style={styles.leftGroup}>
								<SkeletonBlock style={styles.rankSkeleton} />
								<SkeletonBlock style={styles.nameSkeleton} />
							</View>
							<SkeletonBlock style={styles.scoreSkeleton} />
						</View>
					</View>
				))}
			</ScrollView>

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					activeTab={0}
					setActiveTab={() => {}}
					handlePress={() => false}
					values={{ btn1: "Classement", btn2: "Stats" }}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingHorizontal: 24,
		backgroundColor: primaryBackground,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingBottom: 190,
	},
	rowWrapper: {
		borderBottomColor: colorGrey,
		borderBottomWidth: 1,
		marginHorizontal: 20,
	},
	resultRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 18,
	},
	leftGroup: {
		flexDirection: "row",
		alignItems: "center",
	},
	rankSkeleton: {
		width: 22,
		height: 22,
		marginRight: 18,
	},
	nameSkeleton: {
		width: 130,
		height: 20,
	},
	scoreSkeleton: {
		width: 52,
		height: 20,
	},
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 145,
		justifyContent: "center",
		alignItems: "center",
	},
});
