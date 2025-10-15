import QuestionDetails from "@/components/details/questionDetails";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function FavoriteQuestionDetails() {
	const params = useLocalSearchParams();
	const questionId = Number(params?.questionId);

	const { showTabBar, hideTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	return (
		<QuestionDetails questionId={questionId} refetch='FavoriteQuestionsFull' />
	);
}
