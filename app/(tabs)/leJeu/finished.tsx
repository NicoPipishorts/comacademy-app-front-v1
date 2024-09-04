import StatsBar from "@/components/ProgressBar";
import { useGameContext } from "@/providers/gameDataContext";
import { StyleSheet, View } from "react-native";

export default function FinishedSession() {
	const { score } = useGameContext();

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
