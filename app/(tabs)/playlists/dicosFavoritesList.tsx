import FavoritesIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import ReturnButton from "@/components/buttons/returnButton";
import CardFavoriteDico from "@/components/cards/CardFavoriteDico";
import Loader from "@/components/experience/loader";
import {
	FontSize12,
	FontSizeH3,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import { buildCategoryLookups } from "@/helpers/category/buildCategoryLookups";
import useAuthSession from "@/hooks/useAuthSession";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteDicos from "@/hooks/useGetFavoriteDicos";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function QuestionsFavoritesList() {
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteDicos(auth?.user.id);
	const { data: categories } = useCategories();
	const { colorByStaticId, iconByStaticId } = buildCategoryLookups(categories);

	const [isEmptyArray, setIsEmptyArray] = useState<boolean>(false);
const favoriteEntry = favoriteResponse?.data?.[0];
const favoriteWords = favoriteEntry?.attributes?.words?.data ?? [];

	useEffect(() => {
		if (isFetched) {
			setIsEmptyArray(favoriteWords.length === 0);
		}
	}, [favoriteWords, isFetched]);

	if (!categories || !isFetched) {
		return <Loader />;
	}

	return (
		<SwipeToGoBack>
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
						favoriteWords.map((word) => {
							const categoriesColors =
								colorByStaticId[word.attributes.Categories];
							const categoriesIcons =
								iconByStaticId[word.attributes.Categories];
							return (
								<CardFavoriteDico
									key={word.id}
									data={word}
									categoriesColors={categoriesColors}
									categoriesIcons={categoriesIcons}
								/>
							);
						})}
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
