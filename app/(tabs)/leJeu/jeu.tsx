import { startNewGameSession } from "@/api/gameNewSession";
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
import useGameQuestions from "@/hooks/useGameQuestions";
import useGameSessions from "@/hooks/useGameSessions";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { Answer } from "@/types/enums";
import { GameData } from "@/types/game";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Swiper from "react-native-deck-swiper";

const Jeu = () => {
	const swiperRef = useRef<Swiper<GameData>>(null);
	const navigation = useNavigation<NavigationType>();
	const [creatingNewSessions, setCreatingNewSession] = useState<boolean>(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [feedbackMessage, setFeedbackMessage] = useState<Answer | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [currentCardData, setCurrentCardData] = useState<GameData | null>(null);
	const [favoriteQuestions, setFavoriteQuestions] = useState<number[]>([]);
	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const { userId } = useUserId();
	const { token } = useJwtToken();

	const handlePress = () => {
		showTabBar();
		navigation.navigate("index");
	};

	useEffect(() => {
		hideTabBar();
		return () => showTabBar(); // Ensure tab bar is shown again when component unmounts
	}, [hideTabBar, showTabBar]); // Define onSuccess and onError handlers

	const { data: dataGame } = useGameQuestions();
	const { data: catData } = useCategories();
	const { data: fqData } = useGetFavoriteQuestions(userId);

	const { data: gameSessions } = useGameSessions(userId);
	const handleError = (error: any) => {
		console.error(error);
	};
	const handleSuccessNewGameSession = (data: any) => {};
	const newGameSession = startNewGameSession(
		handleSuccessNewGameSession,
		handleError
	);

	useEffect(() => {
		if (!gameSessions) {
			if (userId && token && dataGame) {
				newGameSession.mutate({ userId, token, questionsPool: dataGame });
			}
		}
	}, [gameSessions, userId, token, dataGame]);

	useEffect(() => {
		if (fqData) {
			const initialFavQuestions = fqData.data.attributes.questions.data.map(
				(question) => question.id
			);
			setFavoriteQuestions(initialFavQuestions);
		}
	}, [fqData]);

	if (creatingNewSessions) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={colorYellow} />
			</View>
		);
	}

	if (!dataGame || !dataGame.data || !catData || !fqData) {
		return (
			<>
				<View style={styles.loadingContainer}>
					<Text style={styles.noDataText}>No game data available</Text>
				</View>
				<View style={styles.containerBackButton}>
					<TouchableOpacity onPress={handlePress} style={styles.backButton}>
						<Text style={styles.textBackButton}>Quitter</Text>
					</TouchableOpacity>
				</View>
			</>
		);
	}

	const dataArray: GameData[] = Object.keys(dataGame.data).map(
		(key) => dataGame.data[key] as GameData
	);

	const cards = dataArray;

	const handleFeedbackMessage = (message: Answer, cardData: GameData) => {
		setFeedbackMessage(message);
		setCurrentCardData(cardData);
		setTimeout(() => {
			setFeedbackMessage(null);
			setIsModalVisible(true);
		}, 1000);
	};

	const onSwipeLeft = (cardIndex: number) => {
		const currentCard = dataArray[cardIndex];
		if (currentCard && currentCard.attributes.ANSWER === true) {
			handleFeedbackMessage(Answer.false, currentCard);
		} else if (currentCard) {
			handleFeedbackMessage(Answer.true, currentCard);
		}
		setCurrentIndex(cardIndex + 1);
	};

	const onSwipeRight = (cardIndex: number) => {
		const currentCard = dataArray[cardIndex];
		if (currentCard && currentCard.attributes.ANSWER === false) {
			handleFeedbackMessage(Answer.false, currentCard);
		} else if (currentCard) {
			handleFeedbackMessage(Answer.true, currentCard);
		}
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
				stackSeparation={20}
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
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
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
