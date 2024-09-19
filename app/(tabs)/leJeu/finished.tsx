import Loader from "@/components/experience/loader";
import StatsBar from "@/components/ProgressBar";
import useGetGameScore from "@/hooks/useGetScore";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function FinishedSession() {
	const { userId } = useUserId();
	const { setScore, score, sessionId } = useGameContext();

	const { data: gameScore } = useGetGameScore({ gameId: sessionId, userId });

	useEffect(() => {
		if (gameScore) {
			setScore(gameScore);
		}
	}, [setScore, gameScore]);

	if (!gameScore || !score) {
		return <Loader />;
	}

	return (
		<View style={styles.wrapper}>
			<View style={{ width: "100%" }}>
				<StatsBar
					categoriesScore={score.categoryScores}
					title='Tes Stats'
					shadowOpacity={0.2}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "flex-start",
	},
	wrapperProgressBars: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 40,
		marginBottom: 60,
	},
});
