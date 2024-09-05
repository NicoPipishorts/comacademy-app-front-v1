import { FinishGameSession } from "@/api/finishSession";
import { InsertAnswer } from "@/api/gameInsertAnswer";
import Loader from "@/components/experience/loader";
import AnswerModal from "@/components/leJeu/answerModal";
import Card from "@/components/leJeu/Card";
import {
	colorBlack,
	colorGreen,
	colorPink,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import { FontSize20 } from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { Answer } from "@/types/enums";
import { GameData } from "@/types/game";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import FinishedSession from "./finished";

const Jeu = () => {
	const swiperRef = useRef<Swiper<GameData>>(null);
	const navigation = useNavigation<NavigationType>();
	const [feedbackMessage, setFeedbackMessage] = useState<Answer | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [currentCardData, setCurrentCardData] = useState<GameData | null>(null);
	const [favoriteQuestions, setFavoriteQuestions] = useState<number[]>([]);
	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const {
		dataGame,
		setDataGame,
		sessionId,
		setSessionsId,
		questionsLeft,
		setQuestionsLeft,
		score,
		showFinishedModal,
		setShowFinishedModal,
		setPlaying,
	} = useGameContext();

	const handlePress = () => {
		showTabBar();
		setPlaying(false);
		setTimeout(() => {
			navigation.navigate("index");
		}, 100);
	};

	useEffect(() => {
		hideTabBar();
		return () => showTabBar(); // Ensure tab bar is shown again when component unmounts
	}, [hideTabBar, showTabBar]); // Define onSuccess and onError handlers

	useEffect(() => {
		if (sessionId && questionsLeft <= 0) {
			setShowFinishedModal(true);
		} else {
			setShowFinishedModal(false);
		}
	}, [sessionId, questionsLeft, setShowFinishedModal]);

	const handleError = (error: any) => {
		console.error(error);
	};

	const handleSuccessFinish = (data: any) => {
		if (!data.data.attributes.inProgress) {
			setSessionsId(null);
			setDataGame(null);
			setShowFinishedModal(false);
			navigation.popToTop("leJeu");
		}
	};

	const finishGameSession = FinishGameSession(handleSuccessFinish, handleError);

	const { data: catData } = useCategories();
	const { data: fqData } = useGetFavoriteQuestions(userId);

	// useEffect(() => {
	// 	if (questionsLeft <= 0) {
	// 		console.log("in the get score useEffect");
	// 		queryClient.refetchQueries({
	// 			queryKey: ["GameScore"],
	// 		});
	// 		setScore(gameScore);
	// 	}
	// }, [gameScore, questionsLeft, sessionId, setScore, userId]);

	const insertPlayerAnswer = InsertAnswer();

	const handleFinishGame = () => {
		finishGameSession.mutate({
			score: score.percentage,
			token,
			sessionId,
		});
	};

	useEffect(() => {
		if (fqData !== undefined) {
			const initialFavQuestions = fqData.data[0].attributes.questions.data.map(
				(question) => question.id
			);
			setFavoriteQuestions(initialFavQuestions);
		} else {
		}
	}, [fqData]);

	// If dataGame is not yet available, show a loading indicator
	if (!dataGame || !catData || !fqData) {
		return <Loader />;
	}

	// Map dataGame to the cards array

	const handleFeedbackMessage = (message: Answer, cardData: GameData) => {
		setFeedbackMessage(message);
		setCurrentCardData(cardData);
		setTimeout(() => {
			setFeedbackMessage(null);
			setIsModalVisible(true);
		}, 500);
	};

	const onSwipeLeft = (cardIndex: number) => {
		console.log("clicked on swipe left");
		const currentCard = dataGame[cardIndex];
		if (currentCard && currentCard.attributes.ANSWER === false) {
			handleFeedbackMessage(Answer.true, currentCard);
		} else if (currentCard) {
			handleFeedbackMessage(Answer.false, currentCard);
		}
		setQuestionsLeft(questionsLeft - 1);
		insertPlayerAnswer.mutate({
			gameId: sessionId,
			userId: userId,
			questionId: currentCard.id,
			answer: currentCard.attributes.ANSWER === false,
			categorie: currentCard.attributes.CATEGORIE,
			token,
		});
	};

	const onSwipeRight = (cardIndex: number) => {
		const currentCard = dataGame[cardIndex];
		if (currentCard && currentCard.attributes.ANSWER === true) {
			handleFeedbackMessage(Answer.true, currentCard);
		} else if (currentCard) {
			handleFeedbackMessage(Answer.false, currentCard);
		}
		setQuestionsLeft(questionsLeft - 1);
		insertPlayerAnswer.mutate({
			gameId: sessionId,
			userId: userId,
			questionId: currentCard.id,
			answer: currentCard.attributes.ANSWER === true,
			categorie: currentCard.attributes.CATEGORIE,
			token,
		});
	};

	const overlayLabels = {
		left: {
			title: "FAUX",
			style: {
				label: {
					backgroundColor: colorPink,
					borderColor: colorPink,
					color: "white",
					borderWidth: 1,
					fontSize: 24,
				},
				wrapper: {
					flexDirection: "column",
					alignItems: "flex-end",
					justifyContent: "flex-start",
					marginTop: 20,
					marginLeft: -20,
				},
			},
		},
		right: {
			title: "VRAIE",
			style: {
				label: {
					backgroundColor: colorGreen,
					borderColor: colorGreen,
					color: "white",
					borderWidth: 1,
					fontSize: 24,
				},
				wrapper: {
					flexDirection: "column",
					alignItems: "flex-start",
					justifyContent: "flex-start",
					marginTop: 20,
					marginLeft: 20,
				},
			},
		},
	};

	const cards = dataGame;
	const renderCard = (card: GameData, cardIndex: number) => {
		return (
			<Card
				key={card?.id}
				catColors={catData}
				data={card}
				onSwipeLeft={onSwipeLeft}
				onSwipeRight={onSwipeRight}
				cardIndex={cardIndex}
			/>
		);
	};

	return (
		<View style={styles.wrapper}>
			{showFinishedModal && <FinishedSession />}
			{!showFinishedModal && (
				<Swiper
					ref={swiperRef}
					overlayLabels={overlayLabels}
					inputOverlayLabelsOpacityRangeX={[-200, -100, 0, 100, 200]} // 5-value range
					animateOverlayLabelsOpacity={true}
					cards={cards}
					animateCardOpacity={true}
					renderCard={(card, cardIndex) => renderCard(card, cardIndex)}
					verticalSwipe={false}
					onSwipedLeft={(cardIndex) => onSwipeLeft(cardIndex)}
					onSwipedRight={(cardIndex) => onSwipeRight(cardIndex)}
					backgroundColor={"transparent"}
					cardVerticalMargin={120}
					cardHorizontalMargin={30}
					stackSize={5}
					stackScale={5}
					stackSeparation={24}
				/>
			)}
			{feedbackMessage && (
				<View
					style={[
						{
							backgroundColor: `${
								feedbackMessage === Answer.true ? colorGreen : colorPink
							}`,
						},
						styles.feedbackContainer,
					]}>
					<Text style={styles.feedbackText}>{feedbackMessage}</Text>
				</View>
			)}
			<AnswerModal
				visible={isModalVisible}
				feedbackMessage={feedbackMessage}
				setIsModalVisible={setIsModalVisible}
				currentCardData={currentCardData}
				favoriteQuestions={favoriteQuestions}
				setFavoriteQuestions={setFavoriteQuestions}
			/>
			<View style={styles.containerBackButton}>
				{showFinishedModal && (
					<TouchableOpacity
						onPress={handleFinishGame}
						style={styles.backButton}>
						<Text style={styles.textBackButton}>Finir</Text>
					</TouchableOpacity>
				)}

				{!showFinishedModal && (
					<TouchableOpacity onPress={handlePress} style={styles.backButton}>
						<Text style={styles.textBackButton}>Quitter</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	noDataText: {
		fontSize: FontSize20,
		color: colorYellow,
	},
	feedbackContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 15,
	},
	feedbackText: {
		fontSize: 100,
		color: colorWhite,
		fontWeight: "bold",
	},
	containerBackButton: {
		zIndex: 10,
		position: "absolute",
		bottom: 60,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
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
});

export default Jeu;
