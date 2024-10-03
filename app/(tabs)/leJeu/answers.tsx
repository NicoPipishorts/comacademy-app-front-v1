import Loader from "@/components/experience/loader";
import AnswersCard from "@/components/leJeu/answers/AnswersCard";
import {
	colorBlack,
	colorTurquoise,
	colorTurquoiseRGB,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import useCountAllQuestions from "@/hooks/useCountAllQuestions";
import { useGetAnswersTrue } from "@/hooks/useGetAnswersTrue";

import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Answers() {
	const { token } = useJwtToken();
	const { userId } = useUserId();

	const { data: all } = useCountAllQuestions(token);
	const { data: correctAnswers } = useGetAnswersTrue(userId, token);

	if (!userId || !all || !correctAnswers) {
		return <Loader />;
	}

	const progressBarProgressions = () => {
		if (!all || typeof all.count !== "number") {
			return 0;
		}

		// Handle case where answered.count is 0 to avoid division by zero
		if (correctAnswers.data.length === 0 || all.count === 0) {
			return 0;
		}

		const progress = correctAnswers.data.length / all.count;

		// Ensure progress is between 0 and 1 (or 0% to 100%)
		return Math.min(Math.max(progress, 0), 1) * 100;
	};

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			contentContainerStyle={[styles.wrapper, { paddingBottom: 100 }]}
			style={{ flex: 1 }}>
			<View style={styles.cardContainer}>
				<View style={styles.cardResults}>
					<Text style={styles.cardResultsLarge}>
						{correctAnswers.data.length}
					</Text>
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
				<Text style={styles.cardUnlocked}>Bonnes réponses</Text>
			</View>

			<View style={{ paddingTop: 30 }}>
				<Text style={{ fontSize: FontSize16, fontWeight: "bold" }}>
					Joue et débloque en de nouvelles réponses en répondant correctement !
				</Text>
			</View>

			<View style={{ paddingTop: 40 }}>
				{correctAnswers.data.map((answer) => {
					return (
						<AnswersCard
							key={answer.attributes.questionId.data.id}
							id={answer.attributes.questionId.data.id}
							data={answer.attributes.questionId.data.attributes}
							postGame={true}
						/>
					);
				})}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 20,
		paddingBottom: 100,
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	cardContainer: {
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
