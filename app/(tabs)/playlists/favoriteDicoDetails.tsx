import { useLocalSearchParams } from "expo-router";
import DicoDetails from "../dico/dicoDetails";

export default function FavoriteQuestionDetails() {
	const { dicoId } = useLocalSearchParams();

	return <DicoDetails dicoId={Number(dicoId)} />;
}
