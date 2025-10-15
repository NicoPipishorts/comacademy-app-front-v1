import QuestionDetails from "@/components/details/questionDetails";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function AnswersDetails() {
	const params = useLocalSearchParams();
	const questionId = Number(params?.questionId);
	const postGame = Boolean(params?.postGame);
	const { hideTabBar, showTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	return (
		<QuestionDetails
			questionId={questionId}
			refetch='FavoriteQuestions'
			postGame={postGame}
		/>
	);
}
