import FavoritesIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import CardFavoriteDico from "@/components/cards/CardFavoriteDico";
import Loader from "@/components/experience/loader";
import {
	FontSize12,
	FontSizeH3,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteDicos from "@/hooks/useGetFavoriteDicos";
import useUserId from "@/hooks/useUserId";
import ReturnButton from "@/utils/returnButton";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function QuestionsFavoritesList() {
	const { userId } = useUserId();

	const { data: favoriteResponse, isFetched } = useGetFavoriteDicos(userId);
	const { data: categories } = useCategories();

	const [isEmptyArray, setIsEmptyArray] = useState<boolean>(null);
	useEffect(() => {
		if (isFetched) {
			if (
				favoriteResponse.data[0]?.attributes.words.data.length <= 0 ||
				!favoriteResponse.data[0]?.attributes.words.data
			) {
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
		acc[category.id] = category.attributes.backgroundColor;
		return acc;
	}, {});

	// Create categoriesIcons object
	const categoriesIcons = categories.data.reduce((acc, category) => {
		acc[category.id] = category.attributes.smallIcon.data.attributes.url;
		return acc;
	}, {} as { [key: number]: string });

	return (
		<ScrollView contentContainerStyle={styles.wrapper}>
			<ReturnButton />

			<View style={styles.headerContainer}>
				<Image source={FavoritesIcon} style={styles.headerIcon} />
				<View style={{ flexDirection: "column" }}>
					<Text style={styles.headerSubText}>Playlist</Text>
					<Text style={styles.headerText}>Le Dico</Text>
				</View>
			</View>

			<View>
				{!isEmptyArray &&
					favoriteResponse.data[0]?.attributes.words.data.map((word) => (
						<CardFavoriteDico
							key={word.id}
							data={word}
							categoriesColors={categoriesColors}
							categoriesIcons={categoriesIcons}
						/>
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
		marginTop: 50,
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
