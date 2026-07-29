import FavoritesIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import {
	FontSize12,
	FontSizeH3,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { ReactNode } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
	title: string;
	emptyMessage: string;
	loading: boolean;
	isEmpty: boolean;
	children: ReactNode;
}

/**
 * Shared shell for the playlists favorites screens: swipe-back gesture,
 * scroll container, return button, "Playlist" header and empty state.
 */
export default function FavoritesListScreen({
	title,
	emptyMessage,
	loading,
	isEmpty,
	children,
}: Props) {
	const insets = useSafeAreaInsets();

	if (loading) {
		return <Loader />;
	}

	return (
		<SwipeToGoBack>
			<ScrollView
				contentContainerStyle={[
					styles.wrapper,
					{ paddingBottom: insets.bottom + 100 },
				]}>
				<ReturnButton />

				<View style={styles.headerContainer}>
					<Image source={FavoritesIcon} style={styles.headerIcon} />
					<View style={{ flexDirection: "column" }}>
						<Text style={styles.headerSubText}>Playlist</Text>
						<Text style={styles.headerText}>{title}</Text>
					</View>
				</View>

				<View>
					{!isEmpty && children}
					{isEmpty && (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>{emptyMessage}</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</SwipeToGoBack>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		padding: 20,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		marginBottom: 30,
		marginTop: 20,
	},
	headerText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		textTransform: "capitalize",
	},
	headerSubText: {
		fontSize: FontSize12,
	},
	headerIcon: { width: 70, height: 70, marginRight: 10 },
	emptyContainer: {
		marginTop: 50,
		paddingHorizontal: 10,
		alignItems: "center",
	},
	emptyText: {
		fontSize: FontSizeH3,
		fontWeight: "bold",
		textAlign: "center",
	},
});
