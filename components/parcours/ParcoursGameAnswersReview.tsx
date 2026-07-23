import {
	colorBlack,
	colorDarkGrey,
	colorGreen,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import { FontSize12, FontSize14, FontSize16 } from "@/constants/fontsizes";
import { SessionResultsAllquestions } from "@/hooks/useGetEndOfSession";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const booleanLabel = (value: boolean) => (value ? "Vrai" : "Faux");
const reviewCardBackground = "#F5F5F5";

export default function ParcoursGameAnswersReview({
	answers,
}: {
	answers: SessionResultsAllquestions[];
}) {
	if (!answers.length) {
		return (
			<View style={styles.emptyCard}>
				<Text style={styles.emptyTitle}>Résultats indisponibles</Text>
				<Text style={styles.emptyBody}>
					Les réponses de cette ancienne session ne sont plus disponibles.
				</Text>
			</View>
		);
	}

	return (
		<Animated.View entering={FadeIn.duration(240)} style={styles.wrapper}>
			<Text style={styles.eyebrow}>Quiz</Text>
			<Text style={styles.title}>Tes réponses</Text>
			<View style={styles.answersList}>
				{answers.map((answer, index) => {
					const isCorrect = answer.userAnswer === answer.questionAnswer;
					const questionId = answer.questionId ?? answer.id;

					return (
						<Pressable
							key={`${answer.id}-${questionId}-${index}`}
							onPress={() => {
								router.push({
									pathname: "/parcours/answers-details",
									params: {
										id:
											answer.answerDocumentId ??
											answer.questionDocumentId ??
											String(questionId),
										answerDocumentId:
											answer.answerDocumentId ?? undefined,
										questionId: String(questionId),
										questionDocumentId:
											answer.questionDocumentId ?? undefined,
										postGame: "true",
									},
								});
							}}
							style={[
								styles.answerCard,
								{ borderLeftColor: isCorrect ? colorGreen : colorPink },
							]}>
							<Text
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.question}>
								{answer.question}
							</Text>
							<View style={styles.correctAnswerBadge}>
								<Text style={styles.correctAnswerText}>
									{booleanLabel(answer.questionAnswer)}
								</Text>
							</View>
						</Pressable>
					);
				})}
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		gap: 12,
	},
	eyebrow: {
		fontSize: FontSize12,
		fontWeight: "800",
		color: colorDarkGrey,
		textTransform: "uppercase",
	},
	title: {
		fontSize: 28,
		lineHeight: 32,
		fontWeight: "900",
		color: colorBlack,
		marginBottom: 4,
	},
	answersList: {
		gap: 14,
	},
	answerCard: {
		backgroundColor: reviewCardBackground,
		borderRadius: 20,
		borderLeftWidth: 8,
		paddingLeft: 12,
		paddingRight: 16,
		paddingVertical: 13,
		gap: 14,
	},
	question: {
		fontSize: FontSize16,
		lineHeight: 22,
		fontWeight: "400",
		color: colorBlack,
		width: "100%",
	},
	correctAnswerBadge: {
		alignSelf: "flex-end",
		backgroundColor: colorBlack,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	correctAnswerText: {
		fontSize: FontSize16,
		fontWeight: "400",
		color: colorWhite,
	},
	emptyCard: {
		backgroundColor: colorWhite,
		borderRadius: 20,
		padding: 24,
		gap: 8,
	},
	emptyTitle: {
		fontSize: FontSize16,
		fontWeight: "900",
		color: colorBlack,
		textAlign: "center",
	},
	emptyBody: {
		fontSize: FontSize14,
		lineHeight: 20,
		fontWeight: "600",
		color: colorDarkGrey,
		textAlign: "center",
	},
});
