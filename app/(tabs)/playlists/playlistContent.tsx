import PlaylistIcon from "@/assets/imgs/icons/FavoritePlaylist.png";
import CardFavoritesItem from "@/components/cards/CardFavoritesItem";
import Loader from "@/components/experience/loader";
import { FontSize12, FontSizeScreenTitles } from "@/constants/fontsizes";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestionsFull from "@/hooks/useGetFavoriteQuestionsFull";
import useUserId from "@/hooks/useUserId";
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PlaylistContent() {
	const { userId } = useUserId();
	const { destination } = useLocalSearchParams();
	const { data: favoriteData } = useGetFavoriteQuestionsFull(userId);
	const { data: categories } = useCategories();

	if (!favoriteData || !categories) {
		return <Loader />;
	}

	// Transform the useSearchLocal param from potential Array to string
	const content = Array.isArray(destination)
		? destination.join(", ")
		: destination;

	//Define the icon to show
	const icon = () => {
		if (content === "favorites") {
			return PlaylistIcon;
		}
	};

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
				<Image source={icon()} style={styles.headerIcon} />
				<View style={{ flexDirection: "column" }}>
					<Text style={styles.headerSubText}>Playlist</Text>
					<Text style={styles.headerText}>{content}</Text>
				</View>
			</View>

			<View>
				{favoriteData.data.attributes.questions.data.map((question) => {
					return (
						<CardFavoritesItem
							data={question.attributes}
							categoriesColors={categoriesColors}
							categoriesIcons={categoriesIcons}
						/>
					);
				})}
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
