import { useAddFavoriteQuestionMutation } from "@/api/favoriteQuestion";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import { colorBlack, colorWhite } from "@/constants/colors";
import { queryClient } from "@/hooks/reactQueryConfig";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useQuestionById from "@/hooks/useQuestionById";
import useUserId from "@/hooks/useUserId";
import { useCallback, useEffect, useState } from "react";
import {
	Image,
	ImageStyle,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Loader from "../experience/loader";
import SmallCategroieIcons from "../SmallCategroieIcons";

interface Props {
	questionId: number;
	refetch: string;
	postGame: boolean;
}

export default function QuestionDetails({ questionId, postGame }: Props) {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { token } = useJwtToken();

	const { data } = useQuestionById(questionId);
	const { data: category } = useCategories();
	const { data: userFavoriteQuestions, isFetched: userFavoriteIsFetched } =
		useGetFavoriteQuestions(userId);

	const [filterIfFavoriteExists, setFilterIfFavoriteExists] =
		useState<boolean>(null);
	const [idArray, setIdArray] = useState<number[]>([]);
	const [dataId, setDataId] = useState<number>(null);

	const handleSuccess = () => {
		queryClient.refetchQueries({ queryKey: ["FavoriteQuestions", userId] });
	};

	const mutation = useAddFavoriteQuestionMutation(handleSuccess);

	useEffect(() => {
		if (userFavoriteQuestions?.data[0]) {
			const newArray =
				userFavoriteQuestions?.data[0].attributes.questions.data.map(
					(item) => item.id
				);
			setIdArray(newArray);
		}
	}, [userFavoriteQuestions?.data]);

	useEffect(() => {
		if (idArray) {
			const doesItExist = idArray.some((id) => id === questionId);
			if (doesItExist) {
				setFilterIfFavoriteExists(true);
			} else {
				setFilterIfFavoriteExists(false);
			}
		}
	}, [idArray, questionId]);

	useEffect(() => {
		if (userFavoriteIsFetched && userFavoriteQuestions.data[0]) {
			setDataId(userFavoriteQuestions.data[0].id);
		}
	}, [userFavoriteIsFetched, userFavoriteQuestions]);

	const handleAddFavorite = useCallback(() => {
		if (filterIfFavoriteExists) {
			const updatedIdArray = idArray.filter((id) => id !== questionId);
			const updatedFavoriteQuestions = [...updatedIdArray];
			mutation.mutate({ dataId, updatedFavoriteQuestions, token });
		} else {
			const updatedFavoriteQuestions = [...idArray, questionId];
			if (!dataId) {
				mutation.mutate({ userId, updatedFavoriteQuestions, token });
			} else {
				mutation.mutate({ dataId, updatedFavoriteQuestions, token });
			}
		}
	}, [
		dataId,
		filterIfFavoriteExists,
		idArray,
		mutation,
		questionId,
		token,
		userId,
	]);

	if (!data || !category || !userFavoriteIsFetched) {
		return <Loader />;
	}

	return (
		<ScrollView
			contentContainerStyle={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={[styles.contentContainer]}>
				<Text style={{ fontSize: 22, fontWeight: "bold" }}>
					{data.data.attributes.QUESTION}
				</Text>
			</View>

			<View style={[styles.headerContainer]}>
				<Text style={[styles.headerContainerText]}>
					{data.data.attributes.ANSWER ? "Vrai" : "Faux"}
				</Text>
			</View>

			{postGame && (
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
						<TouchableOpacity onPress={() => handleAddFavorite()}>
							<Image
								source={filterIfFavoriteExists ? HeartFull : Heart}
								style={styles.catIcons as ImageStyle}
								resizeMode='contain'
							/>
						</TouchableOpacity>
					</View>
				</View>
			)}

			<View style={styles.answerContainer}>
				<View style={{ paddingBottom: 20 }}>
					<Text style={{ fontSize: 24, fontWeight: "bold" }}>Réponse</Text>
				</View>
				<Text style={{ fontSize: 16, fontWeight: "bold", lineHeight: 22 }}>
					{data.data.attributes.REPONSE}
				</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		alignItems: "center",
		// padding: 20,
	},
	headerContainer: {
		marginVertical: 30,
		flexShrink: 1,
		display: "flex",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 40,
		backgroundColor: colorBlack,
		borderRadius: 20,
	},
	headerContainerText: {
		fontSize: 50,
		fontWeight: "bold",
		color: colorWhite,
		textTransform: "uppercase",
	},
	wrapperIcons: {
		paddingHorizontal: 40,
		marginBottom: 30,
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
		paddingHorizontal: 30,
	},
	answerContainer: {
		margin: 30,
		marginTop: 0,
		padding: 20,
		borderRadius: 15,
		backgroundColor: colorWhite,
	},
});
