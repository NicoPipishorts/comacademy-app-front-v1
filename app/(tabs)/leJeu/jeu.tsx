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
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Jeu = () => {
	const insets = useSafeAreaInsets();
	const swiperRef = useRef<Swiper<GameSessionQuestionData>>(null);
	const navigation = useNavigation<NavigationType>();
	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const { userId } = useUserId();
	const { token } = useJwtToken();
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
			navigation.navigate("feedbackMessage", {
				answer: Answer.true,
				questionId: currentCard.id,
			});
		} else if (currentCard) {
			navigation.navigate("feedbackMessage", {
				answer: Answer.false,
				questionId: currentCard.id,
			});
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
			navigation.navigate("feedbackMessage", {
				answer: Answer.true,
				questionId: currentCard.id,
			});
		} else if (currentCard) {
			navigation.navigate("feedbackMessage", {
				answer: Answer.false,
				questionId: currentCard.id,
			});
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
			title: "VRAI",
			style: {
				label: {
					backgroundColor: colorBlack,
					borderColor: colorBlack,
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
	const renderCard = (card: GameSessionQuestionData, cardIndex: number) => {
		return <Card key={card?.id} catColors={catData} data={card} />;
	};

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
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
					cardVerticalMargin={120}
					cardHorizontalMargin={30}
					stackSize={5}
					stackScale={5}
					stackSeparation={24}
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
		// paddingTop: 100,
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	noDataText: {
		fontSize: FontSize20,
		color: colorYellow,
	},
	// feedbackContainer: {
	// 	...StyleSheet.absoluteFillObject,
	// 	justifyContent: "center",
	// 	alignItems: "center",
	// 	zIndex: 15,
	// },
	// feedbackText: {
	// 	fontSize: 100,
	// 	color: colorWhite,
	// 	fontWeight: "bold",
	// },
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
