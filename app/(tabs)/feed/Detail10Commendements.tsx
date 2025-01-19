import { useLocalSearchParams } from "expo-router";
import CommandementsDetails from "../commandements/CommandementsDetails";

export default function Detail10Commendements() {
	const params = useLocalSearchParams();
	const itemId = Number(params?.itemId);

	return <CommandementsDetails itemId={itemId} />;
}
