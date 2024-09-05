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
import useGameSessionsQuesions from "@/hooks/useGetCurrentQuestion";
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
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
	const {
		dataGame,
		setDataGame,
		sessionId,
		setSessionsId,
		questionsLeft,
		setQuestionsLeft,
		playing,
		setPlaying,
	} = useGameContext();

	// Always call the hooks
	const { data: gameSessions, isFetched: fetchedGameSessions } =
		useGameSessions(userId);
	const { data: fetchedDataGame } = useGameQuestions();
	const { data: currentQuestions, isFetched: fetchedCurrentQuestions } =
		useGameSessionsQuesions(sessionId);

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

	useEffect(() => {
		if (fetchedGameSessions) {
			if (gameSessions.data[0]?.attributes) {
				setSessionsId(gameSessions.data[0]?.id);
				const sessionQuestionsPool =
					gameSessions.data[0]?.attributes.questionsPool;

				const filteredQuestionsPool =
					questionsLeft > 0
						? sessionQuestionsPool.slice(30 - questionsLeft)
						: sessionQuestionsPool;

				if (!playing) setDataGame(filteredQuestionsPool);
			} else {
				setQuestionsLeft(30);
				setDataGame(
					fetchedDataGame
						? Object.keys(fetchedDataGame.data).map(
								(key) => fetchedDataGame.data[key] as GameData
						  )
						: null
				);
			}
		}
	}, [
		fetchedDataGame,
		fetchedGameSessions,
		gameSessions?.data,
		playing,
		questionsLeft,
		setDataGame,
		setQuestionsLeft,
		setSessionsId,
	]);

	useEffect(() => {
		if (sessionId && fetchedCurrentQuestions) {
			if (currentQuestions.meta.pagination.total > 0) {
				if (!questionsLeft && !playing) {
					setQuestionsLeft(30 - currentQuestions.meta.pagination.total);
				}
			} else {
				if (!questionsLeft) setQuestionsLeft(30);
				setDataGame(
					fetchedDataGame
						? Object.keys(fetchedDataGame.data).map(
								(key) => fetchedDataGame.data[key] as GameData
						  )
						: null
				);
			}
		}
	}, [
		fetchedCurrentQuestions,
		currentQuestions,
		sessionId,
		questionsLeft,
		setQuestionsLeft,
		setDataGame,
		fetchedDataGame,
		playing,
	]);

	const handlePressPlay = () => {
		if (!sessionId) {
			setPlaying(true);
			newGameSession.mutate({ userId, token, questionsPool: dataGame });
		} else {
			setPlaying(true);
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
