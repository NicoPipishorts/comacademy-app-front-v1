import QuestionDetails from "@/components/details/questionDetails";
import useHideTabBarOnFocus from "@/hooks/useHideTabBarOnFocus";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function AnswersDetails() {
	const params = useLocalSearchParams<{
		id?: string | string[];
		answerDocumentId?: string | string[];
		questionId?: string | string[];
		questionDocumentId?: string | string[];
		postGame?: string | string[];
	}>();
	const rawAnswerDocumentId = Array.isArray(params?.answerDocumentId)
		? params.answerDocumentId[0]
		: params?.answerDocumentId;
	const rawQuestionId = Array.isArray(params?.questionId)
		? params.questionId[0]
		: params?.questionId;
	const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
	const parsedQuestionId = Number(rawQuestionId ?? rawId);
	const questionId = Number.isFinite(parsedQuestionId) ? parsedQuestionId : null;
	const answerDocumentId =
		rawAnswerDocumentId ??
		(typeof rawId === "string" && rawId.length > 0 && !Number.isFinite(Number(rawId))
			? rawId
			: undefined);
	const questionDocumentId = Array.isArray(params?.questionDocumentId)
		? params.questionDocumentId[0]
		: params?.questionDocumentId;
	const postGameParam = Array.isArray(params?.postGame)
		? params.postGame[0]
		: params?.postGame;
	const postGame = postGameParam === "true" || postGameParam === "1";
	useHideTabBarOnFocus();

	return (
		<View style={{ flex: 1 }}>
			<QuestionDetails
				answerDocumentId={answerDocumentId}
				questionDocumentId={questionDocumentId}
				questionId={questionId}
				refetch='FavoriteQuestions'
				postGame={postGame}
			/>
		</View>
	);
}
