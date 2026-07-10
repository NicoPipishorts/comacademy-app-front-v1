import QuestionDetails from "@/components/details/questionDetails";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function FavoriteQuestionDetails() {
	const params = useLocalSearchParams();
	const questionDocumentId = String(params?.questionDocumentId ?? "");
	const parsedQuestionId = Number(params?.questionId);
	const questionId = Number.isFinite(parsedQuestionId) ? parsedQuestionId : null;

	const { showTabBar, hideTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	return (
		<QuestionDetails
			questionDocumentId={questionDocumentId}
			questionId={questionId}
			refetch='FavoriteQuestionsFull'
		/>
	);
}
