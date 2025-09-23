import FavoritesIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import ReturnButton from "@/components/buttons/returnButton";
import CardFavoriteCitation from "@/components/cards/feed/CardFavoriteCitation";
import Loader from "@/components/experience/loader";
import {
	FontSize12,
	FontSizeH3,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import useGetFavoriteCitationsFull from "@/hooks/Citations/useGetFavoriteCitationsFull";
import useCategories from "@/hooks/useCategories";
import useUserId from "@/hooks/useUserId";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CitationsFavoritesList() {
	const { userId } = useUserId();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteCitationsFull(userId);
	const { data: categories } = useCategories();

	const [isEmptyArray, setIsEmptyArray] = useState<boolean>(null);
	useEffect(() => {
		if (isFetched) {
			if (favoriteResponse.data.count <= 0) {
				setIsEmptyArray(true);
			} else {
				setIsEmptyArray(false);
			}
		}
	}, [favoriteResponse, isFetched]);

	if (!categories || !isFetched) {
		return <Loader />;
	}

	// Convert categories.data into a single color array
	const categoriesColors = categories.data.reduce((acc, category) => {
		acc[category.id - 6] = category.attributes.backgroundColor;
		return acc;
	}, {});

	// Create categoriesIcons object
	const categoriesIcons = categories.data.reduce((acc, category) => {
		acc[category.id - 6] = category.attributes.smallIcon.data.attributes.url;
		return acc;
	}, {} as { [key: number]: string });

	return (
		<SwipeToGoBack>
			<ScrollView contentContainerStyle={styles.wrapper}>
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
						favoriteResponse.data.results.data.map((word) => (
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
