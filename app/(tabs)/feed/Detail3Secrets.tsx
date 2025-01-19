import { useLocalSearchParams } from "expo-router";
import SecretsDetails from "../secrets/SecretsDetails";

export default function Details3Secrets() {
	const params = useLocalSearchParams();
	const itemId = Number(params?.itemId);

	return <SecretsDetails itemId={itemId} />;
}
