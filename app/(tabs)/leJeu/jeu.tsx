// File: src/components/leJeu/Jeu.tsx
import { useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";

import Loader from "@/components/experience/loader";
import Card from "@/components/leJeu/Card";
import FeedbackMessage from "./feedbackMessage";

import { InsertAnswer } from "@/api/gameInsertAnswer";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import useCategories from "@/hooks/useCategories";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { useNetwork } from "@/providers/NetworkProvider";
import { Answer } from "@/types/enums";
import { NavigationType } from "@/types/general";
import { QuestionData } from "@/types/userGameSessionStatus";

import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize20 } from "@/constants/fontsizes";

export default function Jeu() {
	const { isHomeButtonModel } = useDeviceTypeCheckers();
	const { isConnected } = useNetwork();
	const swiperRef = useRef<Swiper<QuestionData>>(null);
	const navigation = useNavigation<NavigationType>();
	const { hideTabBar, showTabBar } = useTabBarVisibility();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const [feedbackVisible, setFeedbackVisible] = useState(false);
	const [feedbackAnswer, setFeedbackAnswer] = useState<Answer | null>(null);
	const [swiperKey, setSwiperKey] = useState(0);

	const { dataGame, setDataGame, sessionId, gameStatus } = useGameContext();
	const { data: catData } = useCategories();
	const { isFetched: fqIsFetched } = useGetFavoriteQuestions(userId);
	const insertPlayerAnswer = InsertAnswer();

	const removeCardAndCheckEnd = useCallback(
		(cardIndex: number) => {
			setDataGame((prev) => prev.filter((_, i) => i !== cardIndex));
		},
		[setDataGame]
	);

	useEffect(() => {
		setSwiperKey((k) => k + 1);
	}, [dataGame]);

	useEffect(() => {
		hideTabBar();
		return () => showTabBar();
	}, [hideTabBar, showTabBar]);

	if (!dataGame || !catData || !fqIsFetched) {
		return <Loader />;
	}

	const showFeedback = (answer: Answer) => {
		setFeedbackAnswer(answer);
		setFeedbackVisible(true);
	};
	const hideFeedback = () => {
		setFeedbackVisible(false);
		setFeedbackAnswer(null);
	};

	const handlePress = () => {
		showTabBar();
		setTimeout(() => navigation.navigate("index"), 100);
	};

	const onSwipe = (cardIndex: number, answer: boolean) => {
		const currentCard = dataGame[cardIndex];
		if (!currentCard) return;

		const correct = currentCard.attributes.ANSWER;
		showFeedback(correct === answer ? Answer.true : Answer.false);

		insertPlayerAnswer.mutate({
			gameId: sessionId,
			userId,
			questionId: currentCard.id,
			answer,
			categorie: currentCard.attributes.CATEGORIE,
			token,
		});

		removeCardAndCheckEnd(cardIndex);
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
					flexDirection: "row",
					alignItems: "flex-start",
					justifyContent: "flex-end",
					paddingRight: 20,
					width: "100%",
					height: "100%",
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
					flexDirection: "row",
					alignItems: "flex-start",
					justifyContent: "flex-start",
					paddingLeft: 20,
					width: "100%",
					height: "100%",
				},
			},
		},
	};

	const swiperTopMargin = isHomeButtonModel ? -40 : 0;

	return (
		<View style={[styles.wrapper, { marginTop: swiperTopMargin }]}>
			{!isConnected && (
				<View style={styles.overlay}>
					<Text style={styles.overlayText}>
						Tu as perdu ta connexion internet.
					</Text>
					<Text style={styles.overlayText}>
						Ton jeu reprendra dès que tu la retrouveras.
					</Text>
				</View>
			)}

			{gameStatus === "in_progress" && sessionId > 0 && (
				<Swiper
					key={swiperKey}
					ref={swiperRef}
					overlayLabels={overlayLabels}
					cards={dataGame}
					renderCard={(card, cardIndex) =>
						card ? (
							<Card
								key={card.id}
								catColors={catData}
								data={card}
								onSwipeFalse={() => swiperRef.current?.swipeLeft()}
								onSwipeTrue={() => swiperRef.current?.swipeRight()}
							/>
						) : null
					}
					verticalSwipe={false}
					onSwipedLeft={(i) => onSwipe(i, false)}
					onSwipedRight={(i) => onSwipe(i, true)}
					onSwipedAll={() =>
						setTimeout(() => navigation.navigate("finishedSession"), 500)
					}
					backgroundColor='transparent'
					cardVerticalMargin={100}
					cardHorizontalMargin={30}
					stackSize={5}
					stackScale={5}
					stackSeparation={24}
					overlayOpacityHorizontalThreshold={20}
				/>
			)}

			{feedbackVisible && feedbackAnswer && (
				<FeedbackMessage
					answer={feedbackAnswer}
					onHide={hideFeedback}
					isHomeButtonModel={isHomeButtonModel}
				/>
			)}

			<View style={styles.containerBackButton}>
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
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.75)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 999,
	},
	overlayText: {
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
