import SkeletonBlock from "@/components/experience/SkeletonBlock";
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
	const isLoadingAnswers = !!auth?.user.id && !all;

	const hasAnswers = (all?.data?.length ?? 0) > 0;

	const progressBarProgressions = () => {
		if (!all) {
			return 0;
		}
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
					{isLoadingAnswers ? (
						<View style={styles.pointsSkeletonRow}>
							<Text style={styles.pointsNumberSkeletonMain}>88</Text>
							<Text style={styles.pointsNumberSkeletonSide}>/ 88</Text>
						</View>
					) : (
						<>
							<Text style={styles.cardResultsLarge}>{all?.allUserQuestions ?? 0}</Text>
							<Text style={styles.cardResultsSmall}>/ {all?.allQuestions ?? 0}</Text>
						</>
					)}
				</View>
				<View style={styles.cardProgressContainer}>
					{isLoadingAnswers ? (
						<SkeletonBlock style={styles.progressSkeleton} />
					) : (
						<View
							style={[
								styles.cardProgressBar,
								{ width: `${progressBarProgressions()}%` },
							]}
						/>
					)}
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
			{isLoadingAnswers ? (
				Array.from({ length: 8 }).map((_, index) => (
					<View key={`skeleton-${index}`} style={styles.answerSkeletonCard}>
						<SkeletonBlock style={styles.answerSkeletonQuestion} />
						<SkeletonBlock style={styles.answerSkeletonQuestionShort} />
						<View style={styles.answerSkeletonFooter}>
							<SkeletonBlock style={styles.answerSkeletonBadge} />
						</View>
					</View>
				))
			) : hasAnswers ? (
				all!.data.map((answer) => (
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
	pointsSkeletonRow: {
		flexDirection: "row",
		alignItems: "flex-end",
	},
	pointsNumberSkeletonMain: {
		fontSize: 76,
		fontWeight: "bold",
		color: "rgba(255,255,255,0.2)",
	},
	pointsNumberSkeletonSide: {
		fontSize: FontSize16,
		color: "rgba(255,255,255,0.2)",
		paddingBottom: 10,
		marginLeft: 8,
	},
	progressSkeleton: {
		width: "100%",
		height: 10,
		borderRadius: 50,
		backgroundColor: "rgba(255,255,255,0.18)",
	},
	answerSkeletonCard: {
		width: "100%",
		marginBottom: 30,
		borderRadius: 15,
		padding: 15,
		paddingBottom: 10,
		backgroundColor: colorWhite,
	},
	answerSkeletonQuestion: {
		height: 18,
		width: "90%",
		marginBottom: 10,
	},
	answerSkeletonQuestionShort: {
		height: 18,
		width: "68%",
	},
	answerSkeletonFooter: {
		alignItems: "flex-end",
		marginTop: 14,
	},
	answerSkeletonBadge: {
		width: 76,
		height: 34,
		borderRadius: 10,
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
