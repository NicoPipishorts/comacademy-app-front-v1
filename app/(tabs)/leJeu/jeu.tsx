import { InsertAnswer } from "@/api/gameInsertAnswer";
import Loader from "@/components/experience/loader";
import Card from "@/components/leJeu/Card";
import {
	colorBlack,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import { FontSize20 } from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { queryClient } from "@/hooks/reactQueryConfig";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { Answer } from "@/types/enums";
import { GameSessionQuestionData } from "@/types/game";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import FeedbackMessage from "./feedbackMessage";

const Jeu = () => {
	const { isHomeButtonModel } = useDeviceTypeCheckers();

	const swiperRef = useRef<Swiper<GameSessionQuestionData>>(null);
	const navigation = useNavigation<NavigationType>();
	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const [feedbackVisible, setFeedbackVisible] = useState(false);
	const [feedbackAnswer, setFeedbackAnswer] = useState<Answer | null>(null);

	const showFeedback = (answer: Answer) => {
		setFeedbackAnswer(answer);
		setFeedbackVisible(true);
	};

	const hideFeedback = () => {
		setFeedbackVisible(false);
		setFeedbackAnswer(null);
	};

	const {
		dataGame,
		setDataGame,
		sessionId,
		questionsLeft,
		setQuestionsLeft,
		showFinishedModal,
		setShowFinishedModal,
		playing,
		setPlaying,
		setCurrentCardId,
	} = useGameContext();

	const handlePress = () => {
		showTabBar();
		setPlaying(false);
		setDataGame(null);
		queryClient.removeQueries({ queryKey: ["GameQuestions"] });
		setTimeout(() => {
			navigation.navigate("index");
		}, 100);
	};

	useEffect(() => {
		if (showFinishedModal) {
			navigation.navigate("finishedSession");
		}
	}, [navigation, showFinishedModal]);

	useEffect(() => {
		hideTabBar();
		return () => showTabBar();
	}, [hideTabBar, showTabBar]);

	useEffect(() => {
		if (sessionId && questionsLeft <= 0) {
			if (playing) {
				setShowFinishedModal(true);
			}
		} else {
			setShowFinishedModal(false);
		}
	}, [sessionId, questionsLeft, setShowFinishedModal, playing]);

	const { data: catData } = useCategories();
	const { isFetched: fqIsFetched } = useGetFavoriteQuestions(userId);

	const insertPlayerAnswer = InsertAnswer();

	// If dataGame is not yet available, show a loading indicator
	if (!dataGame || !catData || !fqIsFetched) {
		return <Loader />;
	}

	const onSwipeLeft = (cardIndex: number) => {
		const currentCard = dataGame[cardIndex];
		setCurrentCardId(currentCard.id);
		if (currentCard && currentCard.attributes.ANSWER === false) {
			showFeedback(Answer.true);
		} else if (currentCard) {
			showFeedback(Answer.false);
		}
		setQuestionsLeft(questionsLeft - 1);
		insertPlayerAnswer.mutate({
			gameId: sessionId,
			userId: userId,
			questionId: currentCard.id,
			answer: false,
			categorie: currentCard.attributes.CATEGORIE,
			token,
		});
	};

	const onSwipeRight = (cardIndex: number) => {
		const currentCard = dataGame[cardIndex];
		setCurrentCardId(currentCard.id);
		if (currentCard && currentCard.attributes.ANSWER === true) {
			showFeedback(Answer.true);
		} else if (currentCard) {
			showFeedback(Answer.false);
		}
		setQuestionsLeft(questionsLeft - 1);
		insertPlayerAnswer.mutate({
			gameId: sessionId,
			userId: userId,
			questionId: currentCard.id,
			answer: true,
			categorie: currentCard.attributes.CATEGORIE,
			token,
		});
	};

	const overlayLabels = {
		left: {
			title: "FAUX",
			style: {
				label: {
					backgroundColor: colorBlack,
					borderColor: colorBlack,
					color: "white",
					borderWidth: 1,
					fontSize: 24,
					// transform: [{ rotate: "-90deg" }], // Rotate text -90 degrees for FAUX
				},
				wrapper: {
					flexDirection: "row", // Align the overlay to span vertically
					alignItems: "flex-start",
					justifyContent: "center",
					width: "100%", // Take up half the width
					height: "100%", // Take up full height
				},
			},
		},
		right: {
			title: "VRAI",
			style: {
				label: {
					backgroundColor: colorBlack,
					borderColor: colorBlack,
					color: "white",
					borderWidth: 1,
					fontSize: 24,
					// transform: [{ rotate: "90deg" }], // Rotate text +90 degrees for VRAI
				},
				wrapper: {
					flexDirection: "row", // Align the overlay to span vertically
					alignItems: "flex-start",
					justifyContent: "center",
					width: "100%", // Take up half the width
					height: "100%", // Take up full height
				},
			},
		},
	};

	const cards = dataGame;
	const renderCard = (card: GameSessionQuestionData) => {
		return <Card key={card?.id} catColors={catData} data={card} />;
	};

	const swiperTopMargin = () => {
		if (isHomeButtonModel) {
			return -40;
		} else {
			return 0;
		}
	};

	return (
		<View style={[styles.wrapper, { marginTop: swiperTopMargin() }]}>
			{!showFinishedModal && (
				<Swiper
					ref={swiperRef}
					overlayLabels={overlayLabels}
					cards={cards}
					renderCard={(card, cardIndex) => renderCard(card, cardIndex)}
					verticalSwipe={false}
					onSwipedLeft={(cardIndex) => onSwipeLeft(cardIndex)}
					onSwipedRight={(cardIndex) => onSwipeRight(cardIndex)}
					backgroundColor={"transparent"}
					cardVerticalMargin={100}
					cardHorizontalMargin={30}
					stackSize={5}
					stackScale={5}
					stackSeparation={24}
					overlayOpacityHorizontalThreshold={40}
				/>
			)}
			{feedbackVisible && feedbackAnswer && (
				<FeedbackMessage
					answer={feedbackAnswer}
					onHide={hideFeedback}
					isHomeButtonModel
				/>
			)}
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
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	noDataText: {
		fontSize: FontSize20,
		color: colorYellow,
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
