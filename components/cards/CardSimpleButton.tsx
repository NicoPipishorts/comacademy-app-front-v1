import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize22 } from "@/constants/fontsizes";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	image?: string;
	content: string;
	link: () => void;
}

export default function CardSimpleButton({ image, content, link }: Props) {
	return (
		<View style={styles.cardWrapper}>
			<View style={styles.cardTextContainer}>
				<Text style={styles.cardText}>{content}</Text>
				<TouchableOpacity style={styles.buttonBlack} onPress={link}>
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
		alignItems: "center",
		maxWidth: "100%",
	},
	cardText: {
		width: "60%",
		fontSize: FontSize22,
		fontWeight: "bold",
		flexGrow: 1,
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
