import {
	colorBlack,
	colorDarkGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import {
	FontSize12,
	FontSize14,
	FontSize16,
	FontSize18,
} from "@/constants/fontsizes";
import { ParcoursDicoAnswerOption } from "@/types/parcours";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ParcoursDicoQuestionStep({
	word,
	definition,
	answers,
	selectedAnswerKey,
	onSelectAnswer,
	accentColor,
	disabled = false,
}: {
	word: string;
	definition?: string | null;
	answers: ParcoursDicoAnswerOption[];
	selectedAnswerKey?: string | null;
	onSelectAnswer: (answerKey: string) => void;
	accentColor: string;
	disabled?: boolean;
}) {
	return (
		<View style={styles.container}>
			<Text style={styles.stepLabel}>Dico Quiz</Text>
			<View style={[styles.promptCard, { backgroundColor: accentColor }]}>
				<Text style={styles.promptWord}>{word}</Text>
				{definition ? <Text style={styles.promptHint}>{definition}</Text> : null}
			</View>
			<View style={styles.answersList}>
				{answers.map((answer) => {
					const isSelected = selectedAnswerKey === answer.key;
					return (
						<Pressable
							key={answer.key}
							disabled={disabled}
							onPress={() => onSelectAnswer(answer.key)}
							style={[
								styles.answerRow,
								disabled && styles.answerRowDisabled,
								isSelected && {
									borderColor: accentColor,
									borderWidth: 3,
								},
							]}>
							<View style={styles.answerKeyWrap}>
								<Text style={styles.answerKeyText}>{answer.key.toUpperCase()}</Text>
							</View>
							<Text style={styles.answerLabel}>{answer.label}</Text>
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
		backgroundColor: primaryBackground,
		borderRadius: 22,
		paddingHorizontal: 14,
		paddingVertical: 16,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "transparent",
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
	answerLabel: {
		flex: 1,
		fontSize: FontSize14,
		lineHeight: 20,
		fontWeight: "700",
		color: colorDarkGrey,
	},
});
