import {
	colorBlack,
	colorDarkGrey,
	colorGreen,
	colorLightGrey,
	colorWhite,
} from "@/constants/colors";
import {
	FontSize12,
	FontSize14,
	FontSize16,
	FontSize18,
} from "@/constants/fontsizes";
import { mixParcoursColorWithWhite } from "@/helpers/parcours/theme";
import { ParcoursDicoAnswerOption } from "@/types/parcours";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ParcoursDicoQuestionStep({
	stepLabel = "Dico Quiz",
	word,
	supportingText,
	answers,
	selectedAnswerKey,
	submittedAnswerKey,
	correctAnswerKey,
	answerWasCorrect,
	onSelectAnswer,
	accentColor,
	disabled = false,
	locked = false,
}: {
	stepLabel?: string;
	word: string;
	supportingText?: string | null;
	answers: ParcoursDicoAnswerOption[];
	selectedAnswerKey?: string | null;
	submittedAnswerKey?: string | null;
	correctAnswerKey?: string | null;
	answerWasCorrect?: boolean;
	onSelectAnswer: (answerKey: string) => void;
	accentColor: string;
	disabled?: boolean;
	locked?: boolean;
}) {
	const accentTintColor = mixParcoursColorWithWhite(accentColor, 0.84);

	return (
		<View style={styles.container}>
			<Text style={styles.stepLabel}>{stepLabel}</Text>
			<View style={[styles.promptCard, { backgroundColor: accentColor }]}>
				<Text style={styles.promptWord}>{word}</Text>
				{supportingText ? (
					<Text style={styles.promptHint}>{supportingText}</Text>
				) : null}
			</View>
			<View style={styles.answersList}>
				{answers.map((answer) => {
					const isSelected = selectedAnswerKey === answer.key;
					const isSubmittedChoice = submittedAnswerKey === answer.key;
					const isCorrectAnswer = correctAnswerKey === answer.key;
					const showCorrectState = locked && isCorrectAnswer;
					const showSubmittedWrongState =
						locked && answerWasCorrect === false && isSubmittedChoice && !isCorrectAnswer;
					return (
						<Pressable
							key={answer.key}
							disabled={disabled || locked}
							onPress={() => onSelectAnswer(answer.key)}
							style={[
								styles.answerRow,
								disabled && !locked && styles.answerRowDisabled,
								!locked &&
									isSelected && {
										backgroundColor: accentTintColor,
										borderColor: accentColor,
									},
								showCorrectState && {
									backgroundColor: "rgba(121, 233, 161, 0.22)",
									borderColor: colorGreen,
								},
								showSubmittedWrongState && {
									backgroundColor: accentTintColor,
									borderColor: accentColor,
								},
							]}>
							<View
								style={[
									styles.answerKeyWrap,
									showCorrectState && styles.answerKeyWrapCorrect,
									showSubmittedWrongState && {
										backgroundColor: accentColor,
									},
								]}>
								<Text
									style={[
										styles.answerKeyText,
										showCorrectState && styles.answerKeyTextCorrect,
										showSubmittedWrongState && styles.answerKeyTextSubmittedWrong,
									]}>
									{answer.key.toUpperCase()}
								</Text>
							</View>
							<Text
								style={[
									styles.answerLabel,
									showCorrectState && styles.answerLabelCorrect,
									showSubmittedWrongState && styles.answerLabelSubmittedWrong,
								]}>
								{answer.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 16,
	},
	stepLabel: {
		fontSize: FontSize12,
		fontWeight: "800",
		color: colorBlack,
	},
	promptCard: {
		borderRadius: 22,
		paddingHorizontal: 18,
		paddingVertical: 20,
	},
	promptWord: {
		fontSize: FontSize18,
		fontWeight: "800",
		color: colorWhite,
		marginBottom: 8,
	},
	promptHint: {
		fontSize: FontSize14,
		lineHeight: 20,
		fontWeight: "600",
		color: colorWhite,
		opacity: 0.92,
	},
	answersList: {
		gap: 14,
	},
	answerRow: {
		backgroundColor: colorLightGrey,
		borderRadius: 22,
		paddingHorizontal: 14,
		paddingVertical: 16,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 2,
		borderColor: colorLightGrey,
	},
	answerRowDisabled: {
		opacity: 0.72,
	},
	answerKeyWrap: {
		width: 36,
		height: 36,
		borderRadius: 12,
		backgroundColor: colorWhite,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	answerKeyText: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
	},
	answerKeyWrapCorrect: {
		backgroundColor: colorGreen,
	},
	answerKeyTextCorrect: {
		color: colorBlack,
	},
	answerKeyTextSubmittedWrong: {
		color: colorWhite,
	},
	answerLabel: {
		flex: 1,
		fontSize: FontSize14,
		lineHeight: 20,
		fontWeight: "700",
		color: colorDarkGrey,
	},
	answerLabelCorrect: {
		color: colorBlack,
	},
	answerLabelSubmittedWrong: {
		color: colorBlack,
	},
});
