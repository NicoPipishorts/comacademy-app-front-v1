import QuestionDetails from "@/components/details/questionDetails";
import { useLocalSearchParams } from "expo-router";

export default function AnswersDetails() {
	const params = useLocalSearchParams();
	const questionId = Number(params?.questionId);
	const postGame = params?.postGame;

	return (
		<QuestionDetails
			questionId={questionId}
			refetch='FavoriteQuestions'
			postGame={postGame}
		/>
	);
}
