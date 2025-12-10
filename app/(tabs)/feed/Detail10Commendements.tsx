import { useLocalSearchParams } from "expo-router";
import CommandementsDetails from "../commandements/CommandementsDetails";

export default function Detail10Commendements() {
	const params = useLocalSearchParams();
	const itemId = String(params?.itemId); // Keep as string (documentId)

	return <CommandementsDetails itemId={itemId} />;
}
