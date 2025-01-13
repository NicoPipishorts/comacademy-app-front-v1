import QuestionDetails from "@/components/details/questionDetails";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useLocalSearchParams } from "expo-router";

export default function FavoriteQuestionDetails() {
	const params = useLocalSearchParams();
	const questionId = Number(params?.questionId);

	return (
		<SwipeToGoBack>
			<QuestionDetails
				questionId={questionId}
				refetch='FavoriteQuestionsFull'
			/>
		</SwipeToGoBack>
	);
}
