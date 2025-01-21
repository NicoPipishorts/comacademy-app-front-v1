import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { FontSize14 } from "@/constants/fontsizes";
import { StyleSheet, Text, View } from "react-native";

export default function Feedback() {
	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Feedback' />

			<View style={styles.textContainer}>
				<Text style={styles.presentationText}>
					Vous avez une idée d’amélioration ?
				</Text>
				<Text style={styles.presentationText}>Un retour d’expérience ? </Text>
				<Text style={styles.presentationText}>Un bug à signaler ? </Text>
				<Text style={styles.presentationText}>
					Faites-nous en part, nous serons ravis de vous lire.
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
		padding: 25,
	},
	textContainer: {
		marginVertical: 10,
		gap: 4,
	},
	presentationText: {
		fontSize: FontSize14,
		fontWeight: "bold",
	},
});
