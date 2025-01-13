import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useLocalSearchParams } from "expo-router";
import MetierDetails from "../metiers/metierDetails";

export default function FavoriteQuestionDetails() {
	const params = useLocalSearchParams();
	const metierId = Number(params?.metierId);

	return (
		<SwipeToGoBack>
			<MetierDetails metierId={metierId} />
		</SwipeToGoBack>
	);
}
