import { useAddFavoriteQuestionMutation } from "@/api/favoriteQuestion";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Loader from "@/components/experience/loader";
import SmallCategroieIcons from "@/components/SmallCategroieIcons";
import { colorGreen, colorPink, colorWhite } from "@/constants/colors";
import { queryClient } from "@/hooks/reactQueryConfig";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useQuestionById from "@/hooks/useQuestionById";
import useUserId from "@/hooks/useUserId";
import { useLocalSearchParams } from "expo-router";
import {
	Image,
	ImageStyle,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function AnswersDetails() {
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const params = useLocalSearchParams();
	const questionId = Number(params?.questionId);

	const { data } = useQuestionById(questionId);
	const { data: category } = useCategories();
	const { data: userFavoritQuestions } = useGetFavoriteQuestions(userId);

	const handleSuccess = () => {
		queryClient.refetchQueries({ queryKey: ["FavoriteQuestions", userId] });
	};

	const mutation = useAddFavoriteQuestionMutation(handleSuccess);

	if (!data || !category || !userFavoritQuestions) {
		return <Loader />;
	}

	// Check if the question has already been added to the favorites list.
	const favorites = userFavoritQuestions.data.attributes.questions.data;

	const filterIfFavoriteExists = favorites.some(
		(favorite) => favorite.id === questionId
	);

	// Handle Add Favorite question
	const idArray = favorites.map((favorite) => favorite.id);
	const handleAddFavorite = () => {
		const updatedFavoriteQuestions = [...idArray, questionId];
		mutation.mutate({ userId, updatedFavoriteQuestions, token });
	};

	return (
		<View style={styles.wrapper}>
			<View
				style={[
					styles.headerContainer,
					{
						backgroundColor: data.data.attributes.ANSWER
							? colorGreen
							: colorPink,
					},
				]}>
				<Text style={styles.headerContainerText}>
					{data.data.attributes.ANSWER ? "Vrai" : "Faux"}
				</Text>
			</View>

			<View style={styles.wrapperIcons}>
				<View style={styles.containerIcons}>
					{data.data.attributes.CATEGORIE !== undefined &&
					data.data.attributes.CATEGORIE !== null
						? data.data.attributes.CATEGORIE.split(",").map((cat, index) => {
								const categoryNumber = parseInt(cat, 10);
								return (
									<View style={{ marginRight: 8 }} key={index}>
										<SmallCategroieIcons
											key={categoryNumber}
											cats={categoryNumber}
										/>
									</View>
								);
						  })
						: ""}
				</View>
				<View style={styles.containerIcons}>
					{/* <Image
						source={Plus}
						style={[styles.catIcons, { marginRight: 20 }] as ImageStyle}
						resizeMode='contain'
					/> */}
					<TouchableOpacity onPress={() => handleAddFavorite()}>
						<Image
							source={filterIfFavoriteExists ? HeartFull : Heart}
							style={styles.catIcons as ImageStyle}
							resizeMode='contain'
						/>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.contentContainer}>
				<Text style={{ fontSize: 16, fontWeight: "bold" }}>
					{data.data.attributes.QUESTION}
				</Text>
			</View>

			<View style={styles.answerContainer}>
				<View style={{ paddingBottom: 20 }}>
					<Text style={{ fontSize: 24, fontWeight: "bold" }}>Réponse</Text>
				</View>
				<Text style={{ fontSize: 16, fontWeight: "bold", lineHeight: 22 }}>
					{data.data.attributes.REPONSE}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		// padding: 20,
	},
	headerContainer: {
		display: "flex",
		alignItems: "center",
		paddingVertical: 20,
	},
	headerContainerText: {
		fontSize: 28,
		fontWeight: "bold",
		color: colorWhite,
		textTransform: "uppercase",
	},
	wrapperIcons: {
		padding: 40,
		paddingBottom: 60,
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	containerIcons: {
		flexDirection: "row",
	},
	catIcons: {
		width: 24,
		height: 24,
		aspectRatio: 1,
		marginRight: 5,
	},
	contentContainer: {
		paddingHorizontal: 40,
	},
	answerContainer: {
		margin: 30,
		padding: 20,
		borderRadius: 15,
		backgroundColor: colorWhite,
	},
});
