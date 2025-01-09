import Chevron from "@/assets/imgs/icons/chevron.png";
import { FontSize12 } from "@/constants/fontsizes";
import { useNavigation } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ReturnButton() {
	const navigation = useNavigation();

	return (
		<View style={styles.headerContainer}>
			<Pressable
				style={styles.returnContainer}
				onPress={() => navigation.goBack()}>
				<Image source={Chevron} style={{ width: 14, height: 14 }} />
				<Text style={styles.returnText}>Retour</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	headerContainer: {
		marginTop: 60,
		marginBottom: 30,
	},
	returnContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	returnText: {
		marginLeft: 6,
		fontSize: FontSize12,
		fontWeight: "bold",
	},
});
