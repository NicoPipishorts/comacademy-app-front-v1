// File: src/components/leJeu/Jeu.tsx
import { invalidateGameQuestions } from "@/api/game/invalidateGameQueries";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import * as Haptics from "expo-haptics";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Animated,
	Dimensions,
	PanResponder,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import Loader from "@/components/experience/loader";
import Card from "@/components/leJeu/Card";
import FeedbackMessage from "./feedbackMessage";

import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { useGameQuestions } from "@/hooks/Game/useGameQuestions";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import { useNetwork } from "@/providers/NetworkProvider";
import { Answer } from "@/types/enums";
import { NavigationType } from "@/types/general";
import { QuestionData } from "@/types/userGameSessionStatus";

import { useInsertAnswer } from "@/api/game/useInsertAnswer";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16, FontSize20 } from "@/constants/fontsizes";
import { QUESTIONS_PER_ROUND } from "@/helpers/gameProgress";
import {
	getDisplayedCardCounter,
	getNextCardNumber,
	getSessionCurrentCardNumber,
	getSessionCurrentIndex,
} from "@/helpers/gameSessionProgress";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableCardProps {
	data: QuestionData;
	catColors: any;
	stackPosition: number;
	isTopCard: boolean;
	onSwipe: (isRight: boolean) => void;
}

const SwipeableCard = ({
	data,
	catColors,
	stackPosition,
	isTopCard,
	onSwipe,
}: SwipeableCardProps) => {
	const translateX = useRef(new Animated.Value(0)).current;
	const isSwipingRef = useRef(false);
	const rotate = useMemo(
		() =>
			translateX.interpolate({
				inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
				outputRange: ["-18deg", "0deg", "18deg"],
			}),
		[translateX]
	);

	const leftOpacity = useMemo(
		() =>
			translateX.interpolate({
				inputRange: [-SWIPE_THRESHOLD, 0],
				outputRange: [1, 0],
				extrapolate: "clamp",
			}),
		[translateX]
	);

	const rightOpacity = useMemo(
		() =>
			translateX.interpolate({
				inputRange: [0, SWIPE_THRESHOLD],
				outputRange: [0, 1],
				extrapolate: "clamp",
			}),
		[translateX]
	);

	const triggerSwipe = useCallback(
		(direction: "left" | "right") => {
			if (!isTopCard || isSwipingRef.current) return;
			isSwipingRef.current = true;
			void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			const toValue = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
			Animated.timing(translateX, {
				toValue,
				duration: 200,
				useNativeDriver: true,
			}).start(() => {
				onSwipe(direction === "right");
			});
		},
		[isTopCard, onSwipe, translateX]
	);

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => isTopCard,
				onMoveShouldSetPanResponder: () => isTopCard,
				onPanResponderMove: Animated.event([null, { dx: translateX }], {
					useNativeDriver: false,
				}),
				onPanResponderRelease: (_, gesture) => {
					if (!isTopCard) return;
					if (
						Math.abs(gesture.dx) > SWIPE_THRESHOLD ||
						Math.abs(gesture.vx) > 0.9
					) {
						triggerSwipe(gesture.dx > 0 ? "right" : "left");
					} else {
						Animated.spring(translateX, {
							toValue: 0,
							friction: 6,
							useNativeDriver: true,
						}).start();
					}
				},
			}),
		[isTopCard, translateX, triggerSwipe]
	);

	const effectivePosition = Math.min(stackPosition, 4);
	const scale = useMemo(
		() => 1 - effectivePosition * 0.05,
		[effectivePosition]
	);
	const translateY = useMemo(() => effectivePosition * 22, [effectivePosition]);

	useEffect(() => {
		isSwipingRef.current = false;
		if (!isTopCard) {
			translateX.setValue(0);
		}
	}, [isTopCard, translateX]);

	const transform = useMemo(() => {
		const baseTransform = [{ scale }, { translateY }];

		if (isTopCard) {
			return [{ translateX }, { rotate }, ...baseTransform];
		}

		return baseTransform;
	}, [isTopCard, rotate, scale, translateX, translateY]);

	const cardStyle = useMemo(() => {
		return {
			transform: transform as any,
			zIndex: 100 - stackPosition,
		};
	}, [stackPosition, transform]);

	const handleSwipeTrue = useCallback(() => {
		if (isTopCard) triggerSwipe("right");
	}, [isTopCard, triggerSwipe]);

	const handleSwipeFalse = useCallback(() => {
		if (isTopCard) triggerSwipe("left");
	}, [isTopCard, triggerSwipe]);

	return (
		<Animated.View
			style={[styles.cardWrapper, cardStyle]}
			{...(isTopCard ? panResponder.panHandlers : undefined)}>
			{isTopCard && (
				<>
					<Animated.View
						style={[
							styles.overlayLabel,
							styles.overlayLeft,
							{ opacity: leftOpacity },
						]}>
						<Text style={styles.overlayText}>FAUX</Text>
					</Animated.View>
					<Animated.View
						style={[
							styles.overlayLabel,
							styles.overlayRight,
							{ opacity: rightOpacity },
						]}>
						<Text style={styles.overlayText}>VRAI</Text>
					</Animated.View>
				</>
			)}

			<View style={styles.cardContentWrapper}>
				<Card
					key={data.id}
					catColors={catColors}
					data={data}
					onSwipeFalse={handleSwipeFalse}
					onSwipeTrue={handleSwipeTrue}
				/>
			</View>
		</Animated.View>
	);
};

export default function Jeu() {
	const { isHomeButtonModel } = useDeviceTypeCheckers();
	const { isConnected } = useNetwork();
	const navigation = useNavigation<NavigationType>();
	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const { auth } = useAuthSession();
	const { token, loading: loadingToken } = useJwtToken();
	const { categoryId } = useLocalSearchParams<{ categoryId?: string | string[] }>();
	const [feedbackVisible, setFeedbackVisible] = useState(false);
	const [feedbackAnswer, setFeedbackAnswer] = useState<Answer | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentCardNumber, setCurrentCardNumber] = useState(1);
	const [isCompletingSession, setIsCompletingSession] = useState(false);
	const [activeQuestions, setActiveQuestions] = useState<QuestionData[] | null>(null);
	const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
	const [activeGameStatus, setActiveGameStatus] = useState<
		"in_progress" | "finished"
	>("finished");
	const submittedAnswerKeysRef = useRef<Set<string>>(new Set());
	const initializedRunKeyRef = useRef<string | null>(null);
	const parsedCategoryId = Number(
		Array.isArray(categoryId) ? categoryId[0] : categoryId,
	);
	const categoryFilter =
		Number.isFinite(parsedCategoryId) && parsedCategoryId > 0
			? parsedCategoryId
			: null;
	const { data: catData } = useCategories();
	const { isFetched: fqIsFetched } = useGetFavoriteQuestions(auth?.user.id);
	const { data: sessionData, isLoading: loadingSession } = useGameQuestions(
		auth?.user.id,
		categoryFilter,
		token,
		loadingToken,
		{ createIfMissing: true },
	);
	const gameSession = sessionData?.data;
	const dataGame = activeQuestions;
	const sessionId = activeSessionId;
	const gameStatus = activeGameStatus;

	const insertAnswer = useInsertAnswer();

	useEffect(() => {
		hideTabBar();
		return () => showTabBar();
	}, [hideTabBar, showTabBar]);

	useEffect(() => {
		if (!gameSession) return;

		const runKey = `${gameSession.sessionId}:${categoryFilter ?? "all"}`;
		if (initializedRunKeyRef.current === runKey) {
			return;
		}

		initializedRunKeyRef.current = runKey;
		setActiveQuestions(gameSession.questionsPool);
		setActiveSessionId(gameSession.sessionId);
		setActiveGameStatus(gameSession.status);
		setCurrentCardNumber(getSessionCurrentCardNumber(gameSession));
		setCurrentIndex(getSessionCurrentIndex(gameSession.questionsPool));
		setIsCompletingSession(false);
		submittedAnswerKeysRef.current.clear();
	}, [gameSession, categoryFilter]);

	const cardsToRender = useMemo(() => {
		if (!dataGame || dataGame.length === 0) {
			return [] as QuestionData[];
		}
		const endIndex = Math.max(0, currentIndex + 1);
		const startIndex = Math.max(0, endIndex - 5);
		return dataGame.slice(startIndex, endIndex);
	}, [dataGame, currentIndex]);

	const showFeedback = useCallback((answer: Answer) => {
		setFeedbackAnswer(answer);
		setFeedbackVisible(true);
	}, []);

	const hideFeedback = useCallback(() => {
		setFeedbackVisible(false);
		setFeedbackAnswer(null);
	}, []);

	if (loadingSession || dataGame === null || !catData || !fqIsFetched) {
		return <Loader />;
	}

	const cardsTotal = QUESTIONS_PER_ROUND;
	const cardsSeen = getDisplayedCardCounter(currentCardNumber, dataGame.length);

	const handlePress = () => {
		void invalidateGameQuestions(queryClient, auth?.user.id);

		showTabBar();
		setTimeout(() => navigation.navigate("index"), 100);
	};

	if (isCompletingSession) {
		return (
			<View style={styles.wrapper}>
				<Loader />
			</View>
		);
	}

	if (dataGame.length === 0) {
		const swiperTopMargin = isHomeButtonModel ? -40 : 0;

		return (
			<View style={[styles.wrapper, { marginTop: swiperTopMargin }]}>
				<View style={styles.emptyStateContainer}>
					<Text style={styles.emptyStateTitle}>
						Aucune question disponible pour le moment.
					</Text>
					<Text style={styles.emptyStateSubtitle}>
						Essaie de relancer une session ou reviens plus tard pour une
						nouvelle série.
					</Text>
						<TouchableOpacity onPress={handlePress} style={styles.backButton}>
						<Text style={styles.textBackButton}>Retour</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	const onSwipe = (isRight: boolean) => {
		const userId = auth?.user.id;
		if (!dataGame || !sessionId || !userId) return;
		const currentCard = dataGame[currentIndex];
		if (!currentCard) return;
		const isLastCard = currentIndex === 0;

		const answerKey = `${sessionId}:${userId}:${currentCard.id}`;
		if (submittedAnswerKeysRef.current.has(answerKey)) {
			return;
		}
		submittedAnswerKeysRef.current.add(answerKey);

		const correct = currentCard.attributes.ANSWER;
		showFeedback(correct === isRight ? Answer.true : Answer.false);

		insertAnswer.mutate(
			{
				gameId: sessionId,
				userId,
				questionId: currentCard.id,
				categorie: currentCard.attributes.CATEGORIE,
				answer: isRight,
			},
			{
				onSuccess: () => {
					if (isLastCard) {
						router.push({
							pathname: "/leJeu/finishedSession",
							params: { sessionId: String(sessionId) },
						});
					}
				},
				onError: () => {
					if (isLastCard) {
						setIsCompletingSession(false);
					}
					submittedAnswerKeysRef.current.delete(answerKey);
				},
			}
		);

		if (isLastCard) {
			setCurrentCardNumber(QUESTIONS_PER_ROUND);
			setIsCompletingSession(true);
			setActiveGameStatus("finished");
			return;
		}

		setCurrentCardNumber((count) =>
			getNextCardNumber(count),
		);
		setActiveQuestions((prev) =>
			prev ? prev.filter((question) => question.id !== currentCard.id) : prev,
		);
		setCurrentIndex(currentIndex - 1);
	};

	const swiperTopMargin = isHomeButtonModel ? -40 : 0;

	return (
		<View style={[styles.wrapper, { marginTop: swiperTopMargin }]}>
			{!isConnected && (
				<View style={styles.overlay}>
					<Text style={styles.overlayTextNetwork}>
						Tu as perdu ta connexion internet.
					</Text>
					<Text style={styles.overlayTextNetwork}>
						Ton jeu reprendra dès que tu la retrouveras.
					</Text>
				</View>
			)}

			{isCompletingSession && (
				<View style={styles.overlay}>
					<Loader />
				</View>
			)}

			{gameStatus === "in_progress" && sessionId > 0 && (
				<View style={styles.cardContainer}>
					{cardsToRender.map((card, idx) => {
						const stackPosition = cardsToRender.length - 1 - idx;
						const isTopCard = idx === cardsToRender.length - 1;
						return (
							<SwipeableCard
								key={`${sessionId}-${card.id}`}
								data={card}
								catColors={catData}
								stackPosition={stackPosition}
								isTopCard={isTopCard}
								onSwipe={onSwipe}
							/>
						);
					})}
				</View>
			)}

			{feedbackVisible && feedbackAnswer && (
				<FeedbackMessage
					answer={feedbackAnswer}
					onHide={hideFeedback}
					isHomeButtonModel={isHomeButtonModel}
				/>
			)}

		<View style={styles.containerBackButton}>
			<Text style={styles.cardsLeftText}>
				{cardsSeen} / {cardsTotal}
			</Text>
			<TouchableOpacity onPress={handlePress} style={styles.backButton}>
				<Text style={styles.textBackButton}>Quitter</Text>
			</TouchableOpacity>
		</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		backgroundColor: primaryBackground,
		alignItems: "center",
		position: "relative",
	},
	cardContainer: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	cardWrapper: {
		position: "absolute",
		width: "100%",
		height: "80%",
		borderRadius: 24,
		...Platform.select({
			ios: {
				shadowColor: "rgba(0,0,0,0.25)",
				shadowOffset: { width: 0, height: 12 },
				shadowOpacity: 0.35,
				shadowRadius: 16,
			},
			android: {
				elevation: 0,
			},
		}),
	},
	cardContentWrapper: {
		flex: 1,
		borderRadius: 24,
		overflow: Platform.OS === "android" ? "visible" : "hidden",
	},
	overlayLabel: {
		position: "absolute",
		top: -20,
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: colorBlack,
		backgroundColor: colorBlack,
	},
	overlayLeft: {
		right: 40,
	},
	overlayRight: {
		left: 40,
	},
	overlayText: {
		fontSize: 24,
		fontWeight: "bold",
		color: colorWhite,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.75)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 999,
	},
	overlayTextNetwork: {
		color: colorWhite,
		fontSize: FontSize20,
		fontWeight: "bold",
		textAlign: "center",
		padding: 20,
	},
	containerBackButton: {
		position: "absolute",
		bottom: 60,
		width: "100%",
		alignItems: "center",
		zIndex: 10,
	},
	cardsLeftText: {
		color: colorBlack,
		fontSize: 20,
		fontWeight: 400,
		marginBottom: 12,
	},
	backButton: {
		paddingHorizontal: 40,
		paddingVertical: 10,
		borderRadius: 50,
		backgroundColor: colorBlack,
	},
	textBackButton: {
		color: colorWhite,
		fontSize: FontSize20,
		fontWeight: "bold",
	},
	emptyStateContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	emptyStateTitle: {
		fontSize: FontSize20,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 12,
		color: colorBlack,
	},
	emptyStateSubtitle: {
		textAlign: "center",
		fontSize: FontSize16,
		color: colorBlack,
		marginBottom: 24,
	},
});
