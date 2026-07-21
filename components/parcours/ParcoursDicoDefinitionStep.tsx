import { colorBlack, colorDarkGrey } from "@/constants/colors";
import { FontSize12, FontSize14, FontSize16, FontSize20 } from "@/constants/fontsizes";
import { mixParcoursColorWithWhite } from "@/helpers/parcours/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ParcoursDicoDefinitionStep({
	word,
	definition,
	extraContext,
	accentColor,
}: {
	word: string;
	definition: string;
	extraContext?: string | null;
	accentColor: string;
}) {
	const accentTintColor = mixParcoursColorWithWhite(accentColor, 0.86);

	return (
		<View style={styles.container}>
			<Text style={styles.stepLabel}>Dico Quiz</Text>
			<View style={styles.wordWrap}>
				<Text style={styles.word}>{word}</Text>
			</View>

			<View style={[styles.definitionCard, { backgroundColor: accentTintColor }]}>
				<Text style={[styles.definitionLabel, { color: accentColor }]}>La définition</Text>
				<Text style={styles.definition}>{definition}</Text>
			</View>

			{extraContext ? (
				<View style={[styles.extraCard, { borderColor: accentColor }]}>
					<Text style={styles.extraLabel}>En savoir +</Text>
					<Text style={styles.extraText}>{extraContext}</Text>
				</View>
			) : null}
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
	wordWrap: {
		paddingHorizontal: 6,
		paddingVertical: 14,
	},
	word: {
		fontSize: FontSize20,
		lineHeight: 28,
		fontWeight: "800",
		color: colorBlack,
	},
	definitionCard: {
		borderRadius: 22,
		paddingHorizontal: 20,
		paddingVertical: 22,
		gap: 10,
	},
	definitionLabel: {
		fontSize: FontSize14,
		fontWeight: "900",
		textTransform: "uppercase",
	},
	definition: {
		fontSize: FontSize16,
		lineHeight: 23,
		fontWeight: "500",
		color: colorBlack,
	},
	extraCard: {
		borderRadius: 22,
		borderWidth: 2,
		paddingHorizontal: 20,
		paddingVertical: 18,
		gap: 8,
	},
	extraLabel: {
		fontSize: FontSize14,
		fontWeight: "900",
		color: colorBlack,
	},
	extraText: {
		fontSize: FontSize14,
		lineHeight: 21,
		fontWeight: "600",
		color: colorDarkGrey,
	},
});
