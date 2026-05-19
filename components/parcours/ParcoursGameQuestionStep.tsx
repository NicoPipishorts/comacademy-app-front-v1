import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import Loader from "@/components/experience/loader";
import QuestionSwipeStack from "@/components/leJeu/QuestionSwipeStack";
import useCategories from "@/hooks/useCategories";
import { colorBlack, colorDarkGrey, colorWhite } from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import { QuestionData } from "@/types/userGameSessionStatus";

export default function ParcoursGameQuestionStep({
	questions,
	onSwipe,
	completed,
}: {
	questions: QuestionData[];
	onSwipe: (question: QuestionData, isRight: boolean) => void;
	completed: boolean;
}) {
	const { data: catData } = useCategories();
	const hasQuestions = questions.length > 0;

	const cardsToRender = useMemo(() => {
		if (!hasQuestions) {
			return [];
		}
		const startIndex = Math.max(0, questions.length - 5);
		return questions.slice(startIndex);
	}, [hasQuestions, questions]);

	if (!catData) {
		return <Loader />;
	}

	if (completed) {
		return (
			<View style={styles.stateCard}>
				<Text style={styles.stateTitle}>Jeu terminé</Text>
				<Text style={styles.stateBody}>
					Le parcours du jour est terminé, vous pouvez passer au prochain.
				</Text>
			</View>
		);
	}

	if (!hasQuestions) {
		return (
			<View style={styles.stateCard}>
				<Text style={styles.stateTitle}>Aucune question disponible</Text>
				<Text style={styles.stateBody}>
					Le pool de questions pour ce thème est vide pour le moment.
				</Text>
			</View>
		);
	}

	return (
		<QuestionSwipeStack
			questions={cardsToRender}
			catColors={catData}
			onSwipe={onSwipe}
		/>
	);
}

const styles = StyleSheet.create({
	stateCard: {
		backgroundColor: colorWhite,
		borderRadius: 24,
		padding: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	stateTitle: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorDarkGrey,
		marginBottom: 8,
		textTransform: "uppercase",
		textAlign: "center",
	},
	stateBody: {
		fontSize: FontSize16,
		lineHeight: 22,
		fontWeight: "600",
		color: colorBlack,
		textAlign: "center",
	},
});
