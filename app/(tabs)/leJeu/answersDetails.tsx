import QuestionDetails from "@/components/details/questionDetails";
import { useLocalSearchParams } from "expo-router";

export default function AnswersDetails() {
	const params = useLocalSearchParams();
	const questionId = Number(params?.questionId);
	const postGame = params?.postGame === "true" ? true : false; // Explicitly handle the conversion

	return (
		<QuestionDetails
			questionId={questionId}
			postGame={postGame}
			refetch='FavoriteQuestions'
		/>
	);
}
