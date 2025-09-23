import FavoritesIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import ReturnButton from "@/components/buttons/returnButton";
import CardFavoriteMetier from "@/components/cards/CardFavoriteMetier";
import Loader from "@/components/experience/loader";
import {
	FontSize12,
	FontSizeH3,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import { buildCategoryLookups } from "@/helpers/category/buildCategoryLookups";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import useUserId from "@/hooks/useUserId";
import { FavoriteMetier } from "@/types/metiers";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function QuestionsFavoritesList() {
	const { userId } = useUserId();

	const { data: favoriteResponse, isFetched } = useGetFavoriteMetiers(userId);
	const { data: categories } = useCategories();
	const { colorByStaticId, iconByStaticId } = buildCategoryLookups(categories);

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

	return (
		<SwipeToGoBack>
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
							(metier: FavoriteMetier) => {
								const categoriesColors =
									colorByStaticId[metier.attributes.CATEGORIE];
								const categoriesIcons =
									iconByStaticId[metier.attributes.CATEGORIE];

								return (
									<CardFavoriteMetier
										key={metier.id}
										data={metier}
										categoriesColors={categoriesColors}
										categoriesIcons={categoriesIcons}
									/>
								);
							}
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
