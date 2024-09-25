import { colorBlack, colorTurquoise, colorWhite } from "@/constants/colors";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Loader from "../experience/loader";

interface Props {
	content: string;
	itemId: number;
}

export default function CardSimpleButtonCommandements({
	content,
	itemId,
}: Props) {
	const navigation = useNavigation<NavigationType>();
	let [fontsLoaded] = useFonts({
		Inter_700Bold,
	});

	if (!fontsLoaded) {
		return <Loader />;
	}
	return (
		<View style={styles.cardWrapper}>
			<View style={styles.cardTextContainer}>
				<Text style={styles.cardText}>{content}</Text>
				<View
					style={{
						width: "100%",
						alignItems: "flex-end",
					}}>
					<TouchableOpacity
						style={styles.buttonBlack}
						onPress={() =>
							navigation.navigate("CommandementsDetails", { itemId })
						}>
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
		overflow: "hidden",
		backgroundColor: colorBlack,
	},
	cardTextContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "flex-start",
		maxWidth: "100%",
		padding: 30,
		height: 250,
	},
	cardText: {
		color: colorWhite,
		fontFamily: "Inter_700Bold",
		fontSize: FontSizeScreenTitles,
		flexGrow: 1,
		lineHeight: 36,
	},
	buttonBlack: {
		backgroundColor: colorTurquoise,
		paddingVertical: 10,
		paddingHorizontal: 35,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
