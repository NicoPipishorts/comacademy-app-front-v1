import FavoritesIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import CardFavoriteMetier from "@/components/cards/CardFavoriteMetier";
import Loader from "@/components/experience/loader";
import {
	FontSize12,
	FontSizeH3,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import useUserId from "@/hooks/useUserId";
import { FavoriteMetier } from "@/types/metiers";
import ReturnButton from "@/utils/returnButton";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function QuestionsFavoritesList() {
	const { userId } = useUserId();

	const { data: favoriteResponse, isFetched } = useGetFavoriteMetiers(userId);
	const { data: categories } = useCategories();

	const [isEmptyArray, setIsEmptyArray] = useState<boolean>(null);
	useEffect(() => {
		if (isFetched) {
			if (
				favoriteResponse.data[0]?.attributes.metiers.data.length <= 0 ||
				!favoriteResponse.data[0]?.attributes.metiers.data
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
					<Text style={styles.headerText}>Les Metiers</Text>
				</View>
			</View>

			<View>
				{!isEmptyArray &&
					favoriteResponse.data[0]?.attributes.metiers.data.map(
						(metier: FavoriteMetier) => (
							<CardFavoriteMetier
								key={metier.id}
								data={metier}
								categoriesColors={categoriesColors}
								categoriesIcons={categoriesIcons}
							/>
						)
					)}
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
							Tu n'a pas encore de metiers favorits d'ajouté.
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
