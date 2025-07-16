// File: src/components/leJeu/FinishedSession.tsx
import { LinearGradient } from "expo-linear-gradient";
import { router, useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

import Loader from "@/components/experience/loader";
import {
	useGetEndOfSession,
	useGetEndOfSessionResults,
} from "@/hooks/useGetEndOfSession";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";

import { useSessionAction } from "@/api/game/useNewSession";
import { colorBlack, colorWhite } from "@/constants/colors";
import {
	FontSize14,
	FontSize16,
	FontSize18,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";

export default function FinishedSession() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const { showTabBar } = useTabBarVisibility();
	const { sessionId, setDataGame, setSessionsId, setGameStatus } =
		useGameContext();

	const { data: gameComments } = useGetEndOfSession(userId);

	const originalSessionIdRef = React.useRef(sessionId);
	const { data: sessionResults } = useGetEndOfSessionResults(
		originalSessionIdRef.current
	);

	const { mutate: sessionAction } = useSessionAction(
		(payload, action) => {
			setDataGame(payload.questionsPool);
			setSessionsId(payload.sessionId);
			setGameStatus(payload.status);

			if (action === "end") {
				showTabBar();
				router.replace("/user");
			} else {
				router.replace("/leJeu/jeu");
			}
		},
		(err) => console.error("Session action failed:", err)
	);

	if (!gameComments || !sessionResults || !sessionId) {
		return <Loader />;
	}

	const roundedScore = Math.round(sessionResults.data.percentageCorrect);
	const roundsPlayed =
		Math.round(gameComments.data.totalAnsweredQuestions / 15) % 10;
	const currentNiveau = Math.floor(
		gameComments.data.totalAnsweredQuestions / 15 / 10
	);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={styles.headerTextContainer}>
				<Text style={styles.headerText}>
					{gameComments.data.roundCommentaire}
				</Text>
			</View>

			<View style={{ paddingTop: 40, flexDirection: "row" }}>
				<View style={styles.levelRoundContainer}>
					<Text style={styles.levelText}>Niveau: {currentNiveau}</Text>
					<Text style={styles.levelText}>Round: {roundsPlayed}</Text>
				</View>
			</View>

			<View style={styles.containerResults}>
				<View style={styles.scoreContainer}>
					<View style={styles.scoreTextContainer}>
						<Text style={styles.scoreText}>{roundedScore}</Text>
						<Text style={styles.scoreTextPercentage}>%</Text>
					</View>
					<Text style={styles.scoreFraction}>
						{sessionResults.data.correctAnswers}/15
					</Text>
				</View>

				<View style={styles.progressBarWrapper}>
					<LinearGradient
						colors={["rgba(139,246,153,0.2)", "rgba(12,162,204,0.2)"]}
						style={styles.progressBarBG}>
						<LinearGradient
							colors={["#FF207B", "#5974C9"]}
							style={[styles.progressBar, { width: `${roundedScore}%` }]}
						/>
					</LinearGradient>
				</View>

				<View style={styles.endRowContainer}>
					<Text style={styles.endRowText}>De bonnes réponses</Text>
					<Text style={styles.endRowText}>
						{sessionResults.data.totalPoints} pts
					</Text>
				</View>
			</View>

			<View style={[styles.containerButton, { bottom: 180 }]}>
				<TouchableOpacity
					style={styles.buttonTouchable}
					onPress={() => router.replace("/leJeu/answersPostGame")}>
					<Text style={styles.buttonText}>Voir les réponses</Text>
				</TouchableOpacity>
			</View>

			<View style={[styles.containerBackButton, { bottom: 60 }]}>
				<TouchableOpacity
					onPress={() => sessionAction({ userId, token, action: "end" })}
					style={styles.backButton}>
					<Text style={styles.textBackButton}>Quitter</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => sessionAction({ userId, token, action: "new" })}
					style={styles.backButton}>
					<Text style={styles.textBackButton}>Suivant</Text>
					<Ionicons name='arrow-forward' size={24} color={colorBlack} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

// … your existing StyleSheet …

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "flex-start",
		paddingHorizontal: 30,
	},
	headerTextContainer: {
		marginTop: 40,
		marginBottom: 40,
	},
	headerText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		textAlign: "center",
	},
	levelRoundContainer: {
		marginTop: "5%",
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		flex: 1,
	},
	levelText: {
		fontWeight: "bold",
		fontSize: FontSize18,
	},
	containerResults: {
		marginTop: "5%",
		width: "100%",
		padding: 20,
		paddingTop: 5,
		borderRadius: 15,
		backgroundColor: colorBlack,
	},
	scoreContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	scoreTextContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
	},
	scoreText: {
		fontSize: 85,
		fontWeight: "bold",
		color: colorWhite,
	},
	scoreTextPercentage: {
		fontSize: 40,
		color: colorWhite,
		paddingBottom: 10,
	},
	scoreFraction: {
		fontSize: FontSize18,
		color: colorWhite,
		paddingBottom: 10,
	},
	progressBarWrapper: {},
	progressBarBG: {
		width: "100%",
		height: 10,
		borderRadius: 50,
		overflow: "hidden",
	},
	progressBar: {
		height: 10,
		borderRadius: 50,
	},
	endRowContainer: {
		paddingTop: 10,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	endRowText: {
		fontSize: FontSize14,
		color: colorWhite,
		paddingTop: 10,
	},
	containerButton: {
		position: "absolute",
		left: 30,
		width: "100%",
		alignItems: "center",
	},
	buttonTouchable: {
		backgroundColor: colorBlack,
		borderRadius: 50,
		paddingHorizontal: 26,
		paddingVertical: 14,
	},
	buttonText: {
		fontSize: FontSize16,
		color: colorWhite,
		fontWeight: "bold",
	},
	containerBackButton: {
		position: "absolute",
		width: "92%",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	backButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderRadius: 50,
	},
	textBackButton: {
		color: colorBlack,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
