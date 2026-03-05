import { SingleUserScoreResponse } from "@/hooks/useGetUsersScore";
import { View } from "react-native";
import StatsBar from "../ProgressBar";

interface Props {
	categoriesScore: SingleUserScoreResponse;
}

export default function UserStats({ categoriesScore }: Props) {
	const primaryScore = categoriesScore?.data?.[0];

	if (!primaryScore) {
		return null;
	}

	const scores = primaryScore.attributes;

	return (
		<View style={{ marginTop: 20 }}>
			<StatsBar
				categoriesScore={scores.scoreByCategories}
				title='Mes Stats'
				shadowOpacity={0}
				totalPoints={scores.totalScore}
			/>
		</View>
	);
}
