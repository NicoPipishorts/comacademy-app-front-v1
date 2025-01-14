import { FinishGameSession } from "@/api/finishSession";
import Loader from "@/components/experience/loader";
import { colorBlack, colorWhite, colorYellow } from "@/constants/colors";
import {
	FontSize14,
	FontSize16,
	FontSize18,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import {
	useGetEndOfSession,
	useGetEndOfSessionResults,
} from "@/hooks/useGetEndOfSession";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { NavigationType } from "@/types/general";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FinishedSession() {
	const navigation = useNavigation<NavigationType>();
	const insets = useSafeAreaInsets();
	const { isHomeButtonModel } = useDeviceTypeCheckers();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const {
		setScore,
		score,
		sessionId,
		setSessionsId,
		setDataGame,
		setShowFinishedModal,
		setPlaying,
	} = useGameContext();

	const { data: gameComments } = useGetEndOfSession(userId);
	const { data: sessionResults } = useGetEndOfSessionResults(sessionId);

	useEffect(() => {
		if (sessionResults) {
			setScore(sessionResults.data.totalPoints);
		}
	}, [sessionResults, setScore]);

	const handleError = (error: any) => {
		console.error(error);
	};

	const handleSuccessFinish = (data: any) => {
		setDataGame(null);
		setPlaying(false);
		setSessionsId(null);
		setShowFinishedModal(false);
		navigation.popToTop("leJeu");
	};

	const finishGameSession = FinishGameSession(handleSuccessFinish, handleError);

	if (!gameComments || !sessionResults || !score) {
		return <Loader />;
	}

	const roundedScore = Math.round(sessionResults?.data.percentageCorrect);

	const handleFinishGame = () => {
		finishGameSession.mutate({
			score: roundedScore,
			token,
			sessionId,
		});
	};

	const roundsPlayed = () => {
		const result = (gameComments.data.totalAnsweredQuestions / 15).toString();
		return parseInt(result.slice(-1), 10);
	};

	const currentNiveau = Math.floor(
		Math.floor(gameComments.data.totalAnsweredQuestions / 15) / 10
	);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={styles.headerTextContainer}>
				<Text style={styles.headerText}>
					{gameComments.data.roundCommentaire}
				</Text>
			</View>

			<View
				style={{
					paddingTop: !isHomeButtonModel ? 40 : 0,
					marginBottom: 10,
					flexDirection: "row",
				}}>
				<Text style={{ fontWeight: "bold", fontSize: FontSize18 }}>
					Niveau: {currentNiveau}
				</Text>
			</View>
			<View
				style={[
					styles.brogressbarContainer,
					{ marginBottom: -40, flexDirection: "row" },
				]}>
				{Array(10)
					.fill(0)
					.map((_, index) => (
						<View
							key={index}
							style={{
								width: 20,
								height: 20,
								borderWidth: 2,
								borderColor: colorBlack,
								borderRadius: 20,
								marginHorizontal: 3,
								backgroundColor:
									index < roundsPlayed() ? colorYellow : "transparent",
							}}
						/>
					))}
			</View>

			<View style={styles.containerResults}>
				<View style={styles.scoreContainer}>
					<View style={styles.scoreTextContainer}>
						<Text style={styles.scoreText}>{roundedScore}</Text>
						<Text style={styles.scoreTextPercentage}>%</Text>
					</View>
					<View>
						<Text style={styles.scoreFraction}>
							{sessionResults.data.correctAnswers}/15
						</Text>
					</View>
				</View>
				<View style={styles.brogressbarContainer}>
					<LinearGradient
						colors={["rgba(139, 246, 153, 0.2)", "rgba(12, 162, 204, 0.2)"]}
						style={[styles.brogressbarBG]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}>
						<LinearGradient
							colors={["#FF207B", "#5974C9"]}
							style={[styles.brogressbar, { width: `${roundedScore}%` }]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
						/>
					</LinearGradient>
				</View>
				<View style={styles.endRowContainer}>
					<View>
						<Text style={styles.endRowText}>De bonnes réponses</Text>
					</View>
					<View>
						<Text style={styles.endRowText}>
							{sessionResults.data.totalPoints} pts
						</Text>
					</View>
				</View>
			</View>
			<View
				style={[
					styles.containerButton,
					{ bottom: !isHomeButtonModel ? 130 : 90 },
				]}>
				<TouchableOpacity
					style={styles.buttonTouchable}
					onPress={() => navigation.navigate("answersPostGame")}>
					<Text style={styles.buttonText}>Voir les réponses</Text>
				</TouchableOpacity>
			</View>
			<View
				style={[
					styles.containerBackButton,
					{ bottom: !isHomeButtonModel ? 60 : 30 },
				]}>
				<TouchableOpacity onPress={handleFinishGame} style={styles.backButton}>
					<Text style={styles.textBackButton}>Continuer</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "flex-start",
		paddingHorizontal: 30,
	},
	headerTextContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 40,
		marginBottom: 40,
	},
	headerText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		textAlign: "center",
	},
	containerResults: {
		marginTop: "15%",
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
		justifyContent: "flex-start",
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
	brogressbarContainer: {},
	brogressbarBG: {
		width: "100%",
		height: 10,
		borderRadius: 50,
		overflow: "hidden",
	},
	brogressbar: {
		backgroundColor: "#CC398C",
		height: 10,
		borderRadius: 50,
	},
	endRowContainer: {
		paddingTop: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
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
		zIndex: 10,
		position: "absolute",
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
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
