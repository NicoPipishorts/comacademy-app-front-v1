import QuestionDetails from "@/components/details/questionDetails";
import { useLocalSearchParams } from "expo-router";

export default function FavoriteQuestionDetails() {
	const params = useLocalSearchParams();
	const questionId = Number(params?.questionId);

	return (
		<QuestionDetails questionId={questionId} refetch='FavoriteQuestionsFull' />
	);
}
