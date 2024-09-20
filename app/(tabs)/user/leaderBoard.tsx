import useGetUsersScore from "@/hooks/useGetUsersScore";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeaderBoard() {
	const insets = useSafeAreaInsets();

	const { data: scorePayload } = useGetUsersScore();

	console.log(scorePayload);

	return (
		<>
			<View style={{ paddingTop: insets.top }}>
				<Text>This is the leader board view</Text>
			</View>
		</>
	);
}
