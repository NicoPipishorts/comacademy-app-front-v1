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
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	Image,
	ImageStyle,
	Modal,
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
	questionDocumentId?: string;
	questionId?: number | null;
	refetch: string;
	postGame?: boolean;
}

type HttpError = Error & { status?: number };
type QuestionViewModel = {
	id?: number;
	QUESTION?: string;
	ANSWER?: boolean;
	CATEGORIE?: string | null;
	REPONSE?: string;
};

export default function QuestionDetails({
	questionDocumentId,
	questionId,
	postGame,
}: Props) {
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const router = useRouter();
	const [modalVisible, setModalVisible] = useState(false);

	const { data, error, isError, isLoading } = useQuestionById(
		questionDocumentId,
		questionId
	);
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

	const handleBackPress = useCallback(() => {
		if (typeof router.canGoBack === "function" && router.canGoBack()) {
			router.back();
			return;
		}

		router.replace("/activity");
	}, [router]);

	const handleSuccess = () => {
		queryClient.refetchQueries({
			queryKey: ["FavoriteQuestions", auth?.user.id],
		});
	};

	const mutation = useAddFavoriteQuestionMutation(handleSuccess);
	const questionEntity = data?.data as
		| { id?: number; attributes?: QuestionViewModel }
		| QuestionViewModel
		| undefined;
	const questionAttributes = (
		questionEntity && "attributes" in questionEntity
			? questionEntity.attributes
			: questionEntity
	) as QuestionViewModel | undefined;
	const resolvedQuestionId = questionEntity?.id;

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
		const questionId = resolvedQuestionId;
		if (!questionId) {
			setFilterIfFavoriteExists(false);
			return;
		}

		setFilterIfFavoriteExists(idArray.includes(questionId));
	}, [resolvedQuestionId, idArray]);

	const handleAddFavorite = useCallback(() => {
		const questionId = resolvedQuestionId;
		if (!token || !auth?.user?.id) {
			return;
		}
		if (!questionId) {
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
		token,
		auth?.user.id,
		resolvedQuestionId,
	]);

	if (isLoading || !category || !userFavoriteIsFetched) {
		return <Loader />;
	}

	if (isError || !data || !questionAttributes || !questionAttributes.QUESTION) {
		const httpError = error as HttpError | null;
		const isNotFound = httpError?.status === 404;

		return (
			<Modal visible transparent animationType='fade'>
				<View style={styles.errorWrapper}>
					<View style={styles.errorCard}>
						<ModalGestureLine />
						<Text style={styles.errorTitle}>
							{isNotFound ? "Question introuvable" : "Impossible de charger la question"}
						</Text>
						<Text style={styles.errorText}>
							{isNotFound
								? "Cette question n'est plus disponible. Elle a peut-etre ete supprimee ou deplacee."
								: "Une erreur est survenue pendant le chargement. Reviens a l'ecran precedent puis reessaye."}
						</Text>
						<Pressable
							style={styles.errorButton}
							onPress={handleBackPress}>
							<Text style={styles.errorButtonText}>Retour</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		);
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
						{questionAttributes.QUESTION}
					</Text>
				</View>

				<View style={[styles.headerContainer]}>
					<Text style={[styles.headerContainerText]}>
						{questionAttributes.ANSWER ? "Vrai" : "Faux"}
					</Text>
				</View>

				<View style={styles.wrapperIcons}>
					<View style={styles.containerIcons}>
						{questionAttributes.CATEGORIE !== undefined &&
						questionAttributes.CATEGORIE !== null
							? questionAttributes.CATEGORIE.split(",").map((cat, index) => {
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
						{questionAttributes.REPONSE}
					</Text>
				</View>
			</ScrollView>

				<AddToPlaylistModal
					visible={modalVisible}
					onClose={() => setModalVisible(false)}
					elementId={resolvedQuestionId ?? 0}
					type={"question"}
				/>
		</>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		alignItems: "center",
	},
	errorWrapper: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.45)",
	},
	errorCard: {
		backgroundColor: colorWhite,
		borderRadius: 20,
		padding: 24,
		width: "100%",
		maxWidth: 420,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.18,
		shadowRadius: 24,
		elevation: 8,
	},
	errorTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: colorBlack,
		marginBottom: 12,
	},
	errorText: {
		fontSize: 16,
		lineHeight: 22,
		color: colorBlack,
		marginBottom: 20,
	},
	errorButton: {
		alignSelf: "flex-start",
		backgroundColor: colorBlack,
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 999,
	},
	errorButtonText: {
		color: colorWhite,
		fontWeight: "bold",
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
