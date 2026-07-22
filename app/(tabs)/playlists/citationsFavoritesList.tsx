import FavoritesIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import ReturnButton from "@/components/buttons/returnButton";
import CardFavoriteCitation from "@/components/cards/CardFavoriteCitation";
import Loader from "@/components/experience/loader";
import {
	FontSize12,
	FontSizeH3,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import useGetFavoriteCitationsFull from "@/hooks/Citations/useGetFavoriteCitationsFull";
import useAuthSession from "@/hooks/useAuthSession";
import useCategories from "@/hooks/useCategories";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CitationsFavoritesList() {
	const insets = useSafeAreaInsets();
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteCitationsFull(auth?.user.id);
	const { data: categories } = useCategories();

	const favorites = favoriteResponse?.data?.results?.data ?? [];
	const isEmptyArray = favorites.length === 0;

	if (!categories || !isFetched) {
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
						<Text style={styles.headerText}>Les Citations</Text>
					</View>
				</View>

				<View>
					{!isEmptyArray &&
						favorites.map((word) => (
							<CardFavoriteCitation key={word.id} data={word} />
						))}
					{isEmptyArray && (
						<View
							style={{
								marginTop: 50,
								paddingHorizontal: 10,
								alignItems: "center",
							}}>
							<Text
								style={{
									fontSize: FontSizeH3,
									fontWeight: "bold",
									textAlign: "center",
								}}>
								Tu n'a pas encore de mots favorits d'ajouté.
							</Text>
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
});
