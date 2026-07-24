import QuestionDetails from "@/components/details/questionDetails";
import useHideTabBarOnFocus from "@/hooks/useHideTabBarOnFocus";
import { useLocalSearchParams } from "expo-router";

export default function FavoriteQuestionDetails() {
	const params = useLocalSearchParams();
	const questionDocumentId = String(params?.questionDocumentId ?? "");
	const parsedQuestionId = Number(params?.questionId);
	const questionId = Number.isFinite(parsedQuestionId) ? parsedQuestionId : null;

	useHideTabBarOnFocus();

	return (
		<QuestionDetails
			questionDocumentId={questionDocumentId}
			questionId={questionId}
			refetch='FavoriteQuestionsFull'
		/>
	);
}
