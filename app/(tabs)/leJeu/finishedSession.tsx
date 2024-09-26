import Loader from "@/components/experience/loader";
import { colorBlack, colorWhite } from "@/constants/colors";
import {
	FontSize14,
	FontSize18,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import useGetGameScore from "@/hooks/useGetScore";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FinishedSession() {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { setScore, score, sessionId } = useGameContext();

	const { data: gameScore } = useGetGameScore({ gameId: sessionId, userId });

	useEffect(() => {
		if (gameScore) {
			setScore(gameScore);
		}
	}, [setScore, gameScore]);

	if (!gameScore || !score) {
		return <Loader />;
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top + 30 }]}>
			<View style={styles.headerTextContainer}>
				<Text style={styles.headerText}>Pas mal pour un débutant ...</Text>
			</View>

			<View style={styles.containerResults}>
				<View style={styles.scoreContainer}>
					<View style={styles.scoreTextContainer}>
						<Text style={styles.scoreText}>73</Text>
						<Text style={styles.scoreTextPercentage}>%</Text>
					</View>
					<View>
						<Text style={styles.scoreFraction}>22/30</Text>
					</View>
				</View>
				<View style={styles.brogressbarContainer}>
					<LinearGradient
						colors={["rgba(12, 162, 204, 0.2)", "rgba(139, 246, 153, 0.2)"]}
						style={[styles.brogressbarBG]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}>
						<LinearGradient
							colors={["#FF207B", "#5974C9"]}
							style={[styles.brogressbar]}
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
						<Text style={styles.endRowText}>200 pts</Text>
					</View>
				</View>
			</View>
			<View style={styles.containerButton}>
				<TouchableOpacity style={styles.buttonTouchable}>
					<Text style={styles.buttonText}>Voir les réponses</Text>
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
		marginBottom: 60,
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
		width: "33%",
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
		bottom: 80,
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
		color: colorWhite,
		fontWeight: "bold",
	},
});
