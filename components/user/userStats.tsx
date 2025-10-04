import { colorBlack, colorLightGrey, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { buttonBlack } from "@/constants/commonStyles";
import { SingleUserScoreResponse } from "@/hooks/useGetUsersScore";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StatsBar from "../ProgressBar";

interface Props {
	categoriesScore: SingleUserScoreResponse;
}

export default function UserStats({ categoriesScore }: Props) {
	const navigation = useNavigation<NavigationType>();

	if (!categoriesScore) {
		return null;
	}

	const scores = categoriesScore.data[0].attributes;

	return (
		<View style={{ marginTop: 20 }}>
			<StatsBar
				categoriesScore={scores.scoreByCategories}
				title='Mes Stats'
				shadowOpacity={0}
				totalPoints={scores.totalScore}
			/>
			<View style={styles.cardWrapper}>
				<View style={styles.cardTextContainer}>
					<Text style={styles.cardText}>Découvre le classement général</Text>
					<TouchableOpacity
						style={buttonBlack}
						onPress={() => navigation.navigate("leaderBoard")}>
						<Text style={styles.buttonText}>Voir</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
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
		flexShrink: 1,
		marginRight: 20,
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
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
