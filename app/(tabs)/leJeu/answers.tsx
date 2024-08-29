import Loader from "@/components/experience/loader";
import {
	colorBlack,
	colorTurquoise,
	colorTurquoiseRGB,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14, FontSize16, FontSize18 } from "@/constants/fontsizes";
import useCountAllQuestions from "@/hooks/useCountAllQuestions";
import useCountAnsweredQuestions from "@/hooks/useCountAnsweredQuestions";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Answers() {
	const { token } = useJwtToken();
	const { userId } = useUserId();

	if (!userId) {
		<Loader />;
	}

	const { data: all } = useCountAllQuestions(token);
	const { data: answered } = useCountAnsweredQuestions(userId, token);

	const progressBarProgressions = () => {
		if (
			!all ||
			!answered ||
			typeof all.count !== "number" ||
			typeof answered.count !== "number"
		) {
			return 0;
		}

		// Handle case where answered.count is 0 to avoid division by zero
		if (answered.count === 0 || all.count === 0) {
			return 0;
		}

		const progress = answered.count / all.count;

		// Ensure progress is between 0 and 1 (or 0% to 100%)
		return Math.min(Math.max(progress, 0), 1) * 100;
	};

	return (
		<View style={styles.wrapper}>
			<Text style={styles.headerContainer}>
				Crée tes Playlists avec tes questions favorites et débloque en de
				nouvelles réponses en jouant !
			</Text>

			<View style={styles.cardContainer}>
				<View style={styles.cardResults}>
					<Text style={styles.cardResultsLarge}>{answered?.count}</Text>
					<Text style={styles.cardResultsSmall}>/ {all?.count}</Text>
				</View>
				<View style={styles.cardProgressContainer}>
					<View
						style={[
							styles.cardProgressBar,
							{ width: `${progressBarProgressions()}%` },
						]}
					/>
				</View>
				<Text style={styles.cardUnlocked}>Réponses débloquées</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingTop: 40,
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	headerContainer: {
		width: "100%",
		fontSize: FontSize18,
		fontWeight: "bold",
	},
	cardContainer: {
		marginTop: 40,
		minWidth: "100%",
		borderRadius: 18,
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: colorBlack,
	},
	cardResults: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	cardResultsLarge: {
		fontSize: 76,
		fontWeight: "bold",
		color: colorWhite,
	},
	cardResultsSmall: {
		fontSize: FontSize16,
		color: colorWhite,
		paddingBottom: 10,
	},
	cardProgressContainer: {
		overflow: "hidden",
		minWidth: "100%",
		minHeight: 10,
		marginTop: 5,
		marginBottom: 15,
		borderRadius: 50,
		backgroundColor: `rgba(${colorTurquoiseRGB}, 0.2)`,
	},
	cardProgressBar: {
		minHeight: 10,
		borderRadius: 50,
		backgroundColor: colorTurquoise,
	},
	cardUnlocked: {
		fontSize: FontSize14,
		color: colorWhite,
		fontWeight: "bold",
	},
});
