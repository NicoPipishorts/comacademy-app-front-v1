import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { primaryBackground } from "@/constants/colors";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SkeletonBlock from "./SkeletonBlock";

export default function PlaylistsSkeleton() {
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.wrapper}>
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingTop: insets.top, paddingBottom: insets.bottom + 90 },
				]}
				showsVerticalScrollIndicator={false}>
				<PageTitleAvatarHeader title='Playlists' />

				<View style={styles.addPlaylistContainer}>
					<SkeletonBlock style={styles.addImageSkeleton} />
					<View>
						<SkeletonBlock style={styles.addTitleSkeleton} />
						<SkeletonBlock style={styles.addSubtitleSkeleton} />
					</View>
				</View>

				<View style={styles.playlistsContainer}>
					{Array.from({ length: 7 }).map((_, index) => (
						<View key={`playlist-skeleton-${index}`} style={styles.row}>
							<SkeletonBlock style={styles.rowImageSkeleton} />
							<View>
								<SkeletonBlock style={styles.rowTitleSkeleton} />
								<SkeletonBlock style={styles.rowSubtitleSkeleton} />
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingHorizontal: 24,
		backgroundColor: primaryBackground,
	},
	scrollContent: {
		flexGrow: 1,
	},
	playlistsContainer: {
		paddingTop: 30,
	},
	addPlaylistContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	addImageSkeleton: {
		width: 70,
		height: 70,
		borderRadius: 18,
		marginRight: 15,
	},
	addTitleSkeleton: {
		width: 160,
		height: 22,
		marginBottom: 8,
	},
	addSubtitleSkeleton: {
		width: 120,
		height: 14,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 12,
	},
	rowImageSkeleton: {
		width: 70,
		height: 70,
		borderRadius: 18,
		marginRight: 15,
	},
	rowTitleSkeleton: {
		width: 170,
		height: 20,
		marginBottom: 8,
	},
	rowSubtitleSkeleton: {
		width: 130,
		height: 14,
	},
});
