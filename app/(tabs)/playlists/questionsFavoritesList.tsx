import FavoritesIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import CardFavoriteQuestion from "@/components/cards/CardFavoriteQuestion";
import Loader from "@/components/experience/loader";
import { FontSize12, FontSizeScreenTitles } from "@/constants/fontsizes";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useUserId from "@/hooks/useUserId";
import { FavoriteQuestionsPayloadFull } from "@/types/favoriteQuestions";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function QuestionsFavoritesList() {
	const { userId } = useUserId();
	const [favoriteData, setFavoriteData] =
		useState<FavoriteQuestionsPayloadFull>(null);

	const { data: favoriteResponse, isFetched: favoriteIsFetched } =
		useGetFavoriteQuestions(userId);
	const { data: categories } = useCategories();

	useEffect(() => {
		if (favoriteResponse) {
			setFavoriteData(favoriteResponse);
		}
	}, [favoriteResponse]);

	if (!categories || !favoriteIsFetched) {
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
	}, {} as { [key: number]: string }); // TypeScript typing

	return (
		<ScrollView contentContainerStyle={styles.wrapper}>
			<View style={styles.headerContainer}>
				<Image source={FavoritesIcon} style={styles.headerIcon} />
				<View style={{ flexDirection: "column" }}>
					<Text style={styles.headerSubText}>Playlist</Text>
					<Text style={styles.headerText}>Questions</Text>
				</View>
			</View>

			<View>
				{favoriteResponse &&
					favoriteResponse.data.attributes.questions.data.map((question) => (
						<CardFavoriteQuestion
							key={question.id}
							data={question}
							categoriesColors={categoriesColors}
							categoriesIcons={categoriesIcons}
						/>
					))}
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
