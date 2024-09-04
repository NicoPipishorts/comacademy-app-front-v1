import {
	colorBlack,
	colorDarkGrey,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

// Assets
import { StartNewGameSession } from "@/api/gameNewSession";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { useTab } from "@/context/floatingTabbarContext";
import useGameQuestions from "@/hooks/useGameQuestions";
import useGameSessions from "@/hooks/useGameSessions";
import useGameSessionsQuesionts from "@/hooks/useGetCurrentQuestion";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { GameData } from "@/types/game";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import Answers from "./answers";
import LetsPlay from "./play";

const LeJeu = () => {
	const navigation = useNavigation<NavigationType>();
	const { selectedTab, setSelectedTab } = useTab();
	const [isEnabled, setIsEnabled] = useState(false);
	const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
	const {
		dataGame,
		setDataGame,
		sessionId,
		setSessionsId,
		isCurrentSession,
		setShowFinishedModal,
		setIsCurrentSession,
		setFirstQuestionsInstance,
	} = useGameContext();

	const { userId } = useUserId();
	const { token } = useJwtToken();

	// Always call the hooks
	const { data: gameSessions } = useGameSessions(userId);
	const { data: fetchedDataGame } = useGameQuestions();
	const { data: currentQuestion } = useGameSessionsQuesionts(sessionId);

	const handleSuccessNewGameSession = (data: any) => {
		setSessionsId(data.data.id);
		navigation.navigate("jeu");
	};

	const handleError = (error: any) => {
		console.error(error);
	};

	const newGameSession = StartNewGameSession(
		handleSuccessNewGameSession,
		handleError
	);

	// Determine if a session is in progress
	useEffect(() => {
		if (gameSessions?.data[0]?.id) {
			setSessionsId(gameSessions.data[0].id);
			setIsCurrentSession(true);
			setShowFinishedModal(false);
			setFirstQuestionsInstance(false);
			const sessionQuestionsPool =
				gameSessions.data[0].attributes.questionsPool;

			if (currentQuestion?.meta.pagination.total) {
				const currentOrder = currentQuestion?.meta.pagination.total;

				// Filter out questions that have been answered
				const filteredQuestionsPool =
					currentOrder > 0
						? sessionQuestionsPool.slice(currentOrder)
						: sessionQuestionsPool;

				// Update the session data with the filtered questions
				setDataGame(filteredQuestionsPool);
			} else {
				setDataGame(gameSessions.data[0].attributes.questionsPool);
			}
		} else {
			setFirstQuestionsInstance(true);
			setIsCurrentSession(false);
			setShowFinishedModal(false);
			setDataGame(
				fetchedDataGame
					? Object.keys(fetchedDataGame.data).map(
							(key) => fetchedDataGame.data[key] as GameData
					  )
					: null
			);
		}
	}, [
		gameSessions,
		fetchedDataGame,
		currentQuestion,
		setSessionsId,
		setIsCurrentSession,
		setDataGame,
		setShowFinishedModal,
		setFirstQuestionsInstance,
	]);

	const handlePressPlay = () => {
		if (!isCurrentSession) {
			newGameSession.mutate({ userId, token, questionsPool: dataGame });
		} else {
			navigation.navigate("jeu");
		}
	};

	return (
		<>
			<View style={styles.wrapper}>
				<View style={styles.containerHeader}>
					<View style={styles.header}>
						<Text style={styles.headerMainText}>Le Jeu</Text>
					</View>
					<View style={styles.containerSwitch}>
						<Text style={styles.textJouer}>Jouer</Text>
						<Switch
							trackColor={{ false: colorBlack, true: colorYellow }}
							ios_backgroundColor={colorBlack}
							thumbColor={colorWhite}
							onValueChange={toggleSwitch}
							value={isEnabled}
						/>
						<Text style={styles.textReponses}>Réponses</Text>
					</View>
				</View>

				{!isEnabled && (
					<LetsPlay
						setSelectedTab={setSelectedTab}
						selectedTab={selectedTab}
						handlePressPlay={handlePressPlay}
					/>
				)}

				{isEnabled && <Answers />}
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
	},
	containerHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignContent: "center",
	},
	header: {
		paddingVertical: 15,
	},
	headerMainText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	containerSwitch: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
	},
	textJouer: {
		paddingRight: 8,
		fontWeight: "bold",
	},
	textReponses: {
		paddingLeft: 8,
		fontWeight: "bold",
	},
	finishedModal: {
		position: "absolute",
		backgroundColor: colorDarkGrey,
		width: "90%",
		height: "90%",
		zIndex: 20,
	},
	feedbackText: {
		fontSize: 100,
		color: colorWhite,
		fontWeight: "bold",
	},
});

export default LeJeu;
