import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useLocalSearchParams } from "expo-router";
import DicoDetails from "../dico/dicoDetails";

export default function FavoriteQuestionDetails() {
	const { dicoId } = useLocalSearchParams();

	return (
		<SwipeToGoBack>
			<DicoDetails dicoId={Number(dicoId)} />
		</SwipeToGoBack>
	);
}
