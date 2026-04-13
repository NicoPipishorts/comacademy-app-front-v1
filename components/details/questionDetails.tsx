import { useAddFavoriteQuestionMutation } from "@/api/favoriteQuestion";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Plus from "@/assets/imgs/icons/plus.png";
import { colorBlack, colorWhite } from "@/constants/colors";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useQuestionById from "@/hooks/useQuestionById";
import useResponseDetailsByDocumentId from "@/hooks/useResponseDetailsByDocumentId";
import { logDevice } from "@/helpers/logDevice";
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
import ModalGestureLine from "../experience/modalGestureLine";
import SkeletonBlock from "../experience/SkeletonBlock";
import SmallCategroieIcons from "../icons/SmallCategroieIcons";
import AddToPlaylistModal from "../modal/AddToPlaylistModal";
import QuestionDetailsErrorBoundary from "./QuestionDetailsErrorBoundary";

interface Props {
	answerDocumentId?: string;
	questionDocumentId?: string;
	questionId?: number | null;
	refetch: string;
	postGame?: boolean;
}

type HttpError = Error & { status?: number };
type QuestionViewModel = {
	id?: number;
	QUESTION?: unknown;
	ANSWER?: boolean;
	CATEGORIE?: unknown;
	REPONSE?: unknown;
};

type FavoriteQuestionRelationItem = {
	id?: number;
};

type FavoriteQuestionEntry = {
	id?: number;
	attributes?: {
		questions?: {
			data?: FavoriteQuestionRelationItem[];
		};
	};
	questions?: FavoriteQuestionRelationItem[] | { data?: FavoriteQuestionRelationItem[] };
};

const ENABLE_RESPONSE_PLAYLIST_ACTIONS =
	process.env.EXPO_PUBLIC_ENABLE_RESPONSE_PLAYLIST_ACTIONS === "1";
const ENABLE_RESPONSE_CATEGORY_ICONS =
	process.env.EXPO_PUBLIC_ENABLE_RESPONSE_CATEGORY_ICONS !== "0";
const ENABLE_RESPONSE_SAFE_MODE = false;
const ENABLE_RESPONSE_ULTRA_MINIMAL_MODE = false;
const LOCAL_RESPONSE_DEBUG_DELAY_MS = __DEV__ ? 1000 : 0;

const normalizeTextValue = (value: unknown): string => {
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (Array.isArray(value)) {
		return value
			.map((item) => normalizeTextValue(item))
			.filter((item) => item.trim().length > 0)
			.join(" ");
	}
	if (value && typeof value === "object") {
		try {
			return JSON.stringify(value);
		} catch {
			return "";
		}
	}
	return "";
};

const normalizeCategoryValues = (value: unknown): number[] => {
	if (Array.isArray(value)) {
		return value
			.map((item) => Number(item))
			.filter((item) => Number.isFinite(item) && item > 0);
	}

	if (typeof value === "number") {
		return Number.isFinite(value) && value > 0 ? [value] : [];
	}

	if (typeof value !== "string") {
		return [];
	}

	return value
		.split(",")
		.map((item) => Number(item.trim()))
		.filter((item) => Number.isFinite(item) && item > 0);
};

const extractFavoriteQuestionIds = (entry?: FavoriteQuestionEntry | null): number[] => {
	if (!entry) {
		return [];
	}

	const nestedItems = entry.attributes?.questions?.data;
	if (Array.isArray(nestedItems)) {
		return nestedItems
			.map((item) => item?.id)
			.filter((id): id is number => Number.isFinite(id));
	}

	const flatQuestions = entry.questions;
	if (Array.isArray(flatQuestions)) {
		return flatQuestions
			.map((item) => item?.id)
			.filter((id): id is number => Number.isFinite(id));
	}

	const flatNestedItems = flatQuestions?.data;
	if (Array.isArray(flatNestedItems)) {
		return flatNestedItems
			.map((item) => item?.id)
			.filter((id): id is number => Number.isFinite(id));
	}

	return [];
};

export default function QuestionDetails({
	answerDocumentId,
	questionDocumentId,
	questionId,
	postGame,
}: Props) {
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const router = useRouter();
	const [modalVisible, setModalVisible] = useState(false);

	const useResponseDetails =
		typeof answerDocumentId === "string" && answerDocumentId.length > 0;
	const {
		data: responseDetailsData,
		error: responseDetailsError,
		isError: isResponseDetailsError,
		isLoading: isResponseDetailsLoading,
	} = useResponseDetailsByDocumentId(answerDocumentId);
	const { data, error, isError, isLoading } = useQuestionById(
		useResponseDetails ? undefined : questionDocumentId,
		useResponseDetails ? null : questionId
	);
	const { data: userFavoriteQuestions, isFetched: userFavoriteIsFetched } =
		useGetFavoriteQuestions(auth?.user.id);

	const [filterIfFavoriteExists, setFilterIfFavoriteExists] =
		useState<boolean>(false);
	const [idArray, setIdArray] = useState<number[]>([]);
	const [dataId, setDataId] = useState<number | null>(null);
	const [localDelayComplete, setLocalDelayComplete] = useState(
		LOCAL_RESPONSE_DEBUG_DELAY_MS === 0,
	);

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
	const responseQuestion = responseDetailsData?.data?.question;
	const questionEntity = data?.data as
		| { id?: number; attributes?: QuestionViewModel }
		| QuestionViewModel
		| undefined;
	const questionAttributes = (
		questionEntity && "attributes" in questionEntity
			? questionEntity.attributes
			: questionEntity
	) as QuestionViewModel | undefined;
	const resolvedQuestionId = responseQuestion?.id ?? questionEntity?.id;
	const questionTitle = normalizeTextValue(
		responseQuestion?.title ?? questionAttributes?.QUESTION
	);
	const questionAnswerText = normalizeTextValue(
		responseQuestion?.answerText ?? questionAttributes?.REPONSE
	);
	const categoryValues = normalizeCategoryValues(
		responseQuestion?.categories ?? questionAttributes?.CATEGORIE
	);
	const correctAnswerValue =
		typeof responseQuestion?.correctAnswer === "boolean"
			? responseQuestion.correctAnswer
			: Boolean(questionAttributes?.ANSWER);
	const activeError = useResponseDetails ? responseDetailsError : error;
	const activeIsError = useResponseDetails ? isResponseDetailsError : isError;
	const activeIsLoading = useResponseDetails ? isResponseDetailsLoading : isLoading;
	const activeHasData = useResponseDetails
		? Boolean(responseDetailsData?.data?.question)
		: Boolean(data);
	const showCategoryIcons = Boolean(
		!ENABLE_RESPONSE_SAFE_MODE &&
			ENABLE_RESPONSE_CATEGORY_ICONS &&
			categoryValues.length > 0
	);
	const showFavoriteActions =
		!ENABLE_RESPONSE_SAFE_MODE && userFavoriteIsFetched;
	const shouldShowLoadingState = activeIsLoading || !localDelayComplete;

	useEffect(() => {
		if (LOCAL_RESPONSE_DEBUG_DELAY_MS === 0) {
			setLocalDelayComplete(true);
			return;
		}

		setLocalDelayComplete(false);
		const timer = setTimeout(() => {
			setLocalDelayComplete(true);
		}, LOCAL_RESPONSE_DEBUG_DELAY_MS);

		return () => clearTimeout(timer);
	}, [answerDocumentId, questionDocumentId, questionId]);

	useEffect(() => {
		logDevice("[QuestionDetails] route payload", {
			answerDocumentId: answerDocumentId ?? null,
			questionDocumentId: questionDocumentId ?? null,
			questionId: questionId ?? null,
			postGame: Boolean(postGame),
		});
	}, [answerDocumentId, postGame, questionDocumentId, questionId]);

	useEffect(() => {
		logDevice("[QuestionDetails] query state", {
			isLoading: activeIsLoading,
			isError: activeIsError,
			hasData: activeHasData,
			source: useResponseDetails ? "response-details" : "question",
			resolvedQuestionId: resolvedQuestionId ?? null,
			titleLength: questionTitle.length,
			answerLength: questionAnswerText.length,
			categoryValues,
		});
	}, [
		activeHasData,
		activeIsError,
		activeIsLoading,
		categoryValues,
		questionAnswerText.length,
		questionTitle.length,
		resolvedQuestionId,
		useResponseDetails,
	]);

	useEffect(() => {
		const favoriteEntry = userFavoriteQuestions?.data?.[0] as
			| FavoriteQuestionEntry
			| undefined;
		if (!favoriteEntry) {
			setIdArray([]);
			setDataId(null);
			return;
		}

		const nextIds = extractFavoriteQuestionIds(favoriteEntry);
		setIdArray(nextIds);
		setDataId(typeof favoriteEntry.id === "number" ? favoriteEntry.id : null);
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

	if (shouldShowLoadingState) {
			return (
				<>
					<View style={styles.topHandleWrapper}>
						<ModalGestureLine />
				</View>
				<View style={styles.backButtonWrapper}>
					<ReturnButton />
					</View>
					<ScrollView contentContainerStyle={styles.wrapper}>
						<View style={styles.contentContainer}>
							<SkeletonBlock style={styles.questionTitleSkeletonWide} />
							<SkeletonBlock style={styles.questionTitleSkeletonWide} />
							<SkeletonBlock style={styles.questionTitleSkeletonMedium} />
							<SkeletonBlock style={styles.questionTitleSkeletonShort} />
						</View>

						<View style={styles.headerContainerSkeleton}>
							<SkeletonBlock style={styles.answerLabelSkeleton} />
						</View>

					<View style={styles.wrapperIcons}>
						<View style={styles.containerIcons}>
							<SkeletonBlock style={styles.iconSkeletonWarm} />
							<SkeletonBlock style={styles.iconSkeletonCool} />
							<SkeletonBlock style={styles.iconSkeletonPink} />
						</View>
						<View style={styles.containerIcons}>
							<SkeletonBlock style={styles.iconSkeletonGhost} />
						</View>
					</View>

					<View style={styles.answerContainer}>
						<View style={styles.answerTitleRow}>
							<Text style={{ fontSize: 24, fontWeight: "bold" }}>Réponse</Text>
						</View>
						<SkeletonBlock style={styles.answerLineSkeletonWide} />
						<SkeletonBlock style={styles.answerLineSkeletonWide} />
						<SkeletonBlock style={styles.answerLineSkeletonWide} />
						<SkeletonBlock style={styles.answerLineSkeletonWide} />
						<SkeletonBlock style={styles.answerLineSkeletonWide} />
						<SkeletonBlock style={styles.answerLineSkeletonMedium} />
						<SkeletonBlock style={styles.answerLineSkeletonShort} />
					</View>
				</ScrollView>
			</>
		);
	}

	if (activeIsError || !activeHasData || !questionTitle.trim()) {

		const httpError = activeError as HttpError | null;
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
		<QuestionDetailsErrorBoundary onBack={handleBackPress}>
			{ENABLE_RESPONSE_ULTRA_MINIMAL_MODE ? (
				<View style={styles.ultraMinimalWrapper}>
					<Text style={styles.ultraMinimalText}>
						Response loaded
					</Text>
					<Text style={styles.ultraMinimalMeta}>
						Question #{resolvedQuestionId ?? "unknown"}
					</Text>
					<Text style={styles.ultraMinimalMeta}>
						Title chars: {questionTitle.length}
					</Text>
					<Text style={styles.ultraMinimalMeta}>
						Answer chars: {questionAnswerText.length}
					</Text>
					<Text style={styles.ultraMinimalMeta}>
						Categories: {categoryValues.join(", ") || "none"}
					</Text>
				</View>
			) : (
				<>
					<View style={styles.topHandleWrapper}>
						<ModalGestureLine />
					</View>

					<View style={styles.backButtonWrapper}>
						<ReturnButton />
					</View>
					<ScrollView contentContainerStyle={styles.wrapper}>
						<View style={[styles.contentContainer]}>
							<Text style={{ fontSize: 22, fontWeight: "bold" }}>
								{questionTitle}
							</Text>
						</View>

						<View style={[styles.headerContainer]}>
							<Text style={[styles.headerContainerText]}>
								{correctAnswerValue ? "Vrai" : "Faux"}
							</Text>
						</View>

						<View style={styles.wrapperIcons}>
							<View style={styles.containerIcons}>
								{showCategoryIcons
									? categoryValues.map((categoryNumber, index) => {
											return (
												<View style={{ marginRight: 8 }} key={index}>
													<SmallCategroieIcons
														key={categoryNumber}
														cats={categoryNumber}
													/>
												</View>
											);
									  })
									: <SkeletonBlock style={styles.iconSkeleton} />}
							</View>
							<View style={styles.containerIcons}>
								{showFavoriteActions ? (
									<>
										{ENABLE_RESPONSE_PLAYLIST_ACTIONS ? (
											<Pressable onPress={() => setModalVisible(true)}>
												<Image
													source={Plus}
													style={[styles.catIcons, { marginRight: 20 }] as ImageStyle}
													resizeMode='contain'
												/>
											</Pressable>
										) : null}
										<Pressable onPress={() => handleAddFavorite()}>
											<Image
												source={filterIfFavoriteExists ? HeartFull : Heart}
												style={styles.catIcons as ImageStyle}
												resizeMode='contain'
											/>
										</Pressable>
									</>
								) : (
									<>
										<SkeletonBlock style={[styles.iconSkeleton, { marginRight: 20 }]} />
										<SkeletonBlock style={styles.iconSkeleton} />
									</>
								)}
							</View>
						</View>

					<View style={styles.answerContainer}>
						<View style={{ paddingBottom: 20 }}>
							<Text style={{ fontSize: 24, fontWeight: "bold" }}>Réponse</Text>
						</View>
						<Text style={{ fontSize: 16, fontWeight: "bold", lineHeight: 22 }}>
							{questionAnswerText}
						</Text>
						</View>
					</ScrollView>

					{ENABLE_RESPONSE_PLAYLIST_ACTIONS && modalVisible && resolvedQuestionId ? (
						<AddToPlaylistModal
							visible={modalVisible}
							onClose={() => setModalVisible(false)}
							elementId={resolvedQuestionId}
							type={"question"}
						/>
					) : null}
				</>
			)}
		</QuestionDetailsErrorBoundary>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		alignItems: "center",
		paddingBottom: 40,
	},
	topHandleWrapper: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		width: "100%",
		paddingHorizontal: 20,
		marginTop: 20,
	},
	backButtonWrapper: {
		paddingLeft: 20,
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
	headerContainerSkeleton: {
		marginVertical: 30,
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
		width: "100%",
		paddingHorizontal: 24,
		paddingTop: 12,
	},
	ultraMinimalWrapper: {
		flex: 1,
		paddingHorizontal: 24,
		paddingVertical: 48,
		backgroundColor: colorWhite,
	},
	ultraMinimalText: {
		fontSize: 24,
		fontWeight: "700",
		color: colorBlack,
		marginBottom: 18,
	},
	ultraMinimalMeta: {
		fontSize: 16,
		lineHeight: 24,
		color: colorBlack,
		marginBottom: 10,
	},
	questionTitleSkeleton: {
		height: 24,
		width: "100%",
		marginBottom: 12,
	},
	questionTitleSkeletonWide: {
		height: 24,
		width: "96%",
		marginBottom: 12,
	},
	questionTitleSkeletonShort: {
		height: 24,
		width: "64%",
	},
	questionTitleSkeletonMedium: {
		height: 24,
		width: "78%",
		marginBottom: 12,
	},
	answerLabelSkeleton: {
		width: 114,
		height: 30,
		borderRadius: 9,
		backgroundColor: "rgba(255,255,255,0.2)",
	},
	iconSkeleton: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 12,
	},
	iconSkeletonWarm: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 12,
		backgroundColor: "rgba(230,129,53,0.35)",
	},
	iconSkeletonCool: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 12,
		backgroundColor: "rgba(66,123,201,0.35)",
	},
	iconSkeletonPink: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "rgba(204,57,140,0.35)",
	},
	iconSkeletonGhost: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#E7E7E7",
	},
	answerLineSkeleton: {
		height: 18,
		width: "96%",
		marginBottom: 12,
	},
	answerLineSkeletonWide: {
		height: 18,
		width: "100%",
		marginBottom: 12,
	},
	answerLineSkeletonShort: {
		height: 18,
		width: "58%",
		marginBottom: 12,
	},
	answerLineSkeletonMedium: {
		height: 18,
		width: "82%",
		marginBottom: 12,
	},
	answerContainer: {
		width: "88%",
		marginTop: 0,
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 18,
		borderRadius: 15,
		backgroundColor: colorWhite,
	},
	answerTitleRow: {
		paddingBottom: 18,
	},
});
