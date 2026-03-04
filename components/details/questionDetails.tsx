import { useAddFavoriteQuestionMutation } from "@/api/favoriteQuestion";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Plus from "@/assets/imgs/icons/plus.png";
import { colorBlack, colorWhite } from "@/constants/colors";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useQuestionById from "@/hooks/useQuestionById";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	Image,
	ImageStyle,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import ReturnButton from "../buttons/returnButton";
import Loader from "../experience/loader";
import ModalGestureLine from "../experience/modalGestureLine";
import SmallCategroieIcons from "../icons/SmallCategroieIcons";
import AddToPlaylistModal from "../modal/AddToPlaylistModal";

interface Props {
	questionId: number;
	refetch: string;
	postGame?: boolean;
}

export default function QuestionDetails({ questionId, postGame }: Props) {
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const [modalVisible, setModalVisible] = useState(false);

	const { data } = useQuestionById(questionId);
	const { data: category } = useCategories();
	const { data: userFavoriteQuestions, isFetched: userFavoriteIsFetched } =
		useGetFavoriteQuestions(auth?.user.id);

	const [filterIfFavoriteExists, setFilterIfFavoriteExists] =
		useState<boolean>(false);
	const [idArray, setIdArray] = useState<number[]>([]);
	const [dataId, setDataId] = useState<number | null>(null);

	const { showTabBar, hideTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	const handleSuccess = () => {
		queryClient.refetchQueries({
			queryKey: ["FavoriteQuestions", auth?.user.id],
		});
	};

	const mutation = useAddFavoriteQuestionMutation(handleSuccess);

	useEffect(() => {
		const favoriteEntry = userFavoriteQuestions?.data?.[0];
		if (!favoriteEntry) {
			setIdArray([]);
			setDataId(null);
			return;
		}

		const nextIds =
			favoriteEntry.attributes.questions.data?.map((item) => item.id) ?? [];
		setIdArray(nextIds);
		setDataId(favoriteEntry.id);
	}, [userFavoriteQuestions?.data]);

	useEffect(() => {
		setFilterIfFavoriteExists(idArray.includes(questionId));
	}, [idArray, questionId]);

	const handleAddFavorite = useCallback(() => {
		if (!token || !auth?.user?.id) {
			return;
		}

		if (filterIfFavoriteExists) {
			if (!dataId) {
				return;
			}
			const updatedIdArray = idArray.filter((id) => id !== questionId);
			const updatedFavoriteQuestions = [...updatedIdArray];
			setIdArray(updatedIdArray);
			mutation.mutate({ dataId, updatedFavoriteQuestions, token });
		} else {
			const updatedFavoriteQuestions = [...idArray, questionId];
			setIdArray(updatedFavoriteQuestions);
			if (!dataId) {
				mutation.mutate({
					userId: auth?.user.id,
					updatedFavoriteQuestions,
					token,
				});
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
		auth?.user.id,
	]);

	if (!data || !category || !userFavoriteIsFetched) {
		return <Loader />;
	}

	return (
		<>
			<View
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
					width: "100%",
					paddingHorizontal: 20,
					marginTop: 20,
				}}>
				<ModalGestureLine />
			</View>

			<View style={{ paddingLeft: 20 }}>
				<ReturnButton />
			</View>
			<ScrollView contentContainerStyle={styles.wrapper}>
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
						<>
							<Pressable onPress={() => setModalVisible(true)}>
								<Image
									source={Plus}
									style={[styles.catIcons, { marginRight: 20 }] as ImageStyle}
									resizeMode='contain'
								/>
							</Pressable>
							<Pressable onPress={() => handleAddFavorite()}>
								<Image
									source={filterIfFavoriteExists ? HeartFull : Heart}
									style={styles.catIcons as ImageStyle}
									resizeMode='contain'
								/>
							</Pressable>
						</>
					</View>
				</View>

				<View style={styles.answerContainer}>
					<View style={{ paddingBottom: 20 }}>
						<Text style={{ fontSize: 24, fontWeight: "bold" }}>Réponse</Text>
					</View>
					<Text style={{ fontSize: 16, fontWeight: "bold", lineHeight: 22 }}>
						{data.data.attributes.REPONSE}
					</Text>
				</View>
			</ScrollView>

			<AddToPlaylistModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				elementId={questionId}
				type={"question"}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		alignItems: "center",
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
