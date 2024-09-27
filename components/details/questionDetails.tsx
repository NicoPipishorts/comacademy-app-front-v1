import { useAddFavoriteQuestionMutation } from "@/api/favoriteQuestion";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import { colorGreen, colorPink, colorWhite } from "@/constants/colors";
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
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Loader from "../experience/loader";
import SmallCategroieIcons from "../SmallCategroieIcons";

interface Props {
	questionId: number;
	refetch: string;
	postGame: boolean;
}

export default function QuestionDetails({ questionId, postGame }: Props) {
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
		<View style={styles.wrapper}>
			<View style={[styles.headerContainer]}>
				<Text
					style={[
						styles.headerContainerText,
						{
							color: data.data.attributes.ANSWER ? colorGreen : colorPink,
						},
					]}>
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

			<View
				style={[styles.contentContainer, { paddingTop: postGame ? 0 : 40 }]}>
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
		fontSize: 88,
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
