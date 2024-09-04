import { colorBlack, colorLightGrey, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { UserScoreByCategory } from "@/hooks/useGetAllAnswers";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StatsBar from "../ProgressBar";

interface Props {
	categoriesScore: UserScoreByCategory;
}

export default function UserStats({ categoriesScore }: Props) {
	return (
		<>
			<StatsBar
				categoriesScore={categoriesScore.categoryScores}
				title='Mes Stats'
				shadowOpacity={0}
			/>
			<View style={styles.cardWrapper}>
				<View style={styles.cardTextContainer}>
					<Text style={styles.cardText}>
						Découvre tes résultats selon les catégories
					</Text>
					<TouchableOpacity style={styles.buttonBlack}>
						<Text style={styles.buttonText}>Voir</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		display: "flex",
		flexDirection: "column",
		marginBottom: 40,
		width: "100%",
		borderRadius: 25,
		paddingHorizontal: 20,
		paddingVertical: 30,
		backgroundColor: colorWhite,
	},
	cardTextContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		maxWidth: "100%",
	},
	cardText: {
		width: "60%",
		fontSize: FontSize16,
		fontWeight: "bold",
		flexGrow: 1,
	},
	wrapperProgressBars: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 40,
		marginBottom: 60,
	},
	wrapperProgressBar: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end",
		alignItems: "flex-end",
		overflow: "hidden",
		width: 15,
		height: 160,
		borderRadius: 5,
		backgroundColor: colorLightGrey,
	},
	contentProgressBar: {
		width: "100%",
		borderRadius: 5,
	},
	buttonBlack: {
		backgroundColor: colorBlack,
		paddingVertical: 10,
		paddingHorizontal: 35,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
