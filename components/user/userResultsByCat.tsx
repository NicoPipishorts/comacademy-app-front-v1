import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { buttonBlack } from "@/constants/commonStyles";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function UserResultsByCat() {
	return (
		<View style={styles.cardWrapper}>
			<View style={styles.cardTextContainer}>
				<Text style={styles.cardText}>
					Découvre tes résultats selon les catégories
				</Text>
				<TouchableOpacity style={buttonBlack}>
					<Text style={styles.buttonText}>Voir</Text>
				</TouchableOpacity>
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
		width: "60%",
		fontSize: FontSize16,
		fontWeight: "bold",
		flexGrow: 1,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
