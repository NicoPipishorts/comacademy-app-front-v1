import QuestionDetails from "@/components/details/questionDetails";
import { useLocalSearchParams } from "expo-router";

export default function FavoriteQuestionDetails() {
	const params = useLocalSearchParams();
	const questionId = Number(params?.questionId);
	const postGame = params?.postGame === "true" ? true : false;

	return (
		<QuestionDetails
			questionId={questionId}
			postGame={postGame}
			refetch='FavoriteQuestionsFull'
		/>
	);
}
