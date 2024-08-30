import { insertAnswer } from "@/api/gameInsertAnswer";
import Loader from "@/components/experience/loader";
import AnswerModal from "@/components/leJeu/answerModal";
import Card from "@/components/leJeu/Card";
import {
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

const Jeu = () => {
	const swiperRef = useRef<Swiper<GameData>>(null);
	const navigation = useNavigation<NavigationType>();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [feedbackMessage, setFeedbackMessage] = useState<Answer | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [currentCardData, setCurrentCardData] = useState<GameData | null>(null);
	const [favoriteQuestions, setFavoriteQuestions] = useState<number[]>([]);
	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const { dataGame, setDataGame, sessionId, setSessionsId } = useGameContext();

	const handlePress = () => {
		showTabBar();
		setDataGame(null);
		setSessionsId(null);
		navigation.navigate("index");
	};

	useEffect(() => {
		hideTabBar();
		return () => showTabBar(); // Ensure tab bar is shown again when component unmounts
	}, [hideTabBar, showTabBar]); // Define onSuccess and onError handlers

	const { data: catData } = useCategories();
	const { data: fqData } = useGetFavoriteQuestions(userId);

	const insertPlayerAnswer = insertAnswer();

	useEffect(() => {
		if (fqData) {
			const initialFavQuestions = fqData.data.attributes.questions.data.map(
				(question) => question.id
			);
			setFavoriteQuestions(initialFavQuestions);
		}
	}, [fqData]);

	// If dataGame is not yet available, show a loading indicator
	if (!dataGame || !catData || !fqData) {
		return <Loader />;
	}

	// Map dataGame to the cards array

	const cards = dataGame;

	const handleFeedbackMessage = (message: Answer, cardData: GameData) => {
		setFeedbackMessage(message);
		setCurrentCardData(cardData);
		setTimeout(() => {
			setFeedbackMessage(null);
			setIsModalVisible(true);
		}, 1000);
	};

	const onSwipeLeft = (cardIndex: number) => {
		const currentCard = dataGame[cardIndex];
		if (currentCard && currentCard.attributes.ANSWER === false) {
			handleFeedbackMessage(Answer.true, currentCard);
		} else if (currentCard) {
			handleFeedbackMessage(Answer.false, currentCard);
		}
		insertPlayerAnswer.mutate({
			gameId: sessionId,
			userId: userId,
			questionId: currentCard.id,
			answer: currentCard.attributes.ANSWER === false,
			categorie: currentCard.attributes.CATEGORIE,
			token,
		});
		setCurrentIndex(cardIndex + 1);
	};

	const onSwipeRight = (cardIndex: number) => {
		const currentCard = dataGame[cardIndex];
		if (currentCard && currentCard.attributes.ANSWER === true) {
			handleFeedbackMessage(Answer.true, currentCard);
		} else if (currentCard) {
			handleFeedbackMessage(Answer.false, currentCard);
		}
		insertPlayerAnswer.mutate({
			gameId: sessionId,
			userId: userId,
			questionId: currentCard.id,
			answer: currentCard.attributes.ANSWER === true,
			categorie: currentCard.attributes.CATEGORIE,
			token,
		});
		setCurrentIndex(cardIndex + 1);
	};

	const renderCard = (card: GameData, cardIndex: number) => {
		return (
			<Card
				key={card.id}
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
			<Swiper
				ref={swiperRef}
				cards={cards}
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
				onSwiped={(cardIndex) => setCurrentIndex(cardIndex + 1)}
			/>
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
				<TouchableOpacity onPress={handlePress} style={styles.backButton}>
					<Text style={styles.textBackButton}>Quitter</Text>
				</TouchableOpacity>
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
		paddingHorizontal: 50,
		paddingVertical: 20,
		borderRadius: 50,
		backgroundColor: colorWhite,
	},
	textBackButton: {
		fontSize: FontSize20,
		fontWeight: "bold",
	},
});

export default Jeu;
