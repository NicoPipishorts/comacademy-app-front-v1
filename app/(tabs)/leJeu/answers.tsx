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
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import { useGetUserAnswers } from "@/hooks/useGetAllAnswers";

import useJwtToken from "@/hooks/useJwtToken";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Answers() {
	const { token } = useJwtToken();
	const { auth } = useAuthSession();

	useTrackPageMetrics({ page: "AllAnswers" });

	const { data: all } = useGetUserAnswers(token, auth?.user.id);

	if (!auth?.user.id || !all) {
		return <Loader />;
	}

	const hasAnswers = all.data.length > 0;

	const progressBarProgressions = () => {
		// Handle case where answered.count is 0 to avoid division by zero
		if (all.allUserQuestions === 0) {
			return 0;
		}

		const progress = all.allUserQuestions / all.allQuestions;

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
					<Text style={styles.cardResultsLarge}>{all.allUserQuestions}</Text>
					<Text style={styles.cardResultsSmall}>/ {all.allQuestions}</Text>
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
					Voici toutes tes réponses ! Sois gentil, révise bien celles indiquées
					en rouge, tu vas retomber dessus. Un autre conseil ? Révise aussi
					celles en vert, au cas où tu aurais répondu au pif ;P
				</Text>
			</View>

		<View style={{ paddingTop: 40, width: "100%" }}>
			{hasAnswers ? (
				all.data.map((answer) => (
					<AnswersCard
						key={answer.id}
						id={answer.attributes.questionId}
						questionDocumentId={answer.attributes.questionDocumentId}
						data={answer.attributes}
					/>
				))
			) : (
				<View style={styles.emptyStateContainer}>
					<Text style={styles.emptyStateText}>
						Tu n'as pas encore de réponses enregistrées. Lance une partie
						pour commencer à remplir ton historique.
					</Text>
				</View>
			)}
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
	emptyStateContainer: {
		padding: 24,
		borderRadius: 18,
		backgroundColor: colorWhite,
		alignItems: "center",
	},
	emptyStateText: {
		fontSize: FontSize16,
		textAlign: "center",
	},
});
