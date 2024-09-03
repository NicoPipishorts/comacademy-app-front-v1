import StatsBar from "@/components/ProgressBar";
import { useGameContext } from "@/providers/gameDataContext";
import { StyleSheet, Text, View } from "react-native";

export default function FinishedSession() {
	const { score } = useGameContext();

	console.log(score.categoryScores);
	return (
		<View style={styles.wrapper}>
			<Text style={styles.headerText}>
				La partie est fini ! {score.percentage}{" "}
			</Text>
			<StatsBar categoriesScore={score.categoryScores} />
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	headerText: {
		fontSize: 38,
		fontWeight: "bold",
	},
	wrapperProgressBars: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 40,
		marginBottom: 60,
	},
});
