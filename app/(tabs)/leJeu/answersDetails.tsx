import QuestionDetails from "@/components/details/questionDetails";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";

export default function AnswersDetails() {
	const params = useLocalSearchParams<{
		id?: string | string[];
		questionId?: string | string[];
		questionDocumentId?: string | string[];
		postGame?: string | string[];
	}>();
	const rawQuestionId = Array.isArray(params?.questionId)
		? params.questionId[0]
		: params?.questionId;
	const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
	const parsedQuestionId = Number(rawQuestionId ?? rawId);
	const questionId = Number.isFinite(parsedQuestionId) ? parsedQuestionId : null;
	const questionDocumentId = Array.isArray(params?.questionDocumentId)
		? params.questionDocumentId[0]
		: params?.questionDocumentId;
	const postGameParam = Array.isArray(params?.postGame)
		? params.postGame[0]
		: params?.postGame;
	const postGame = postGameParam === "true" || postGameParam === "1";
	const { hideTabBar, showTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	return (
		<View style={{ flex: 1 }}>
			<QuestionDetails
				questionDocumentId={questionDocumentId}
				questionId={questionId}
				refetch='FavoriteQuestions'
				postGame={postGame}
			/>
		</View>
	);
}
