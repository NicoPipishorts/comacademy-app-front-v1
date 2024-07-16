import Card from "@/components/leJeu/Card";
import { colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize20 } from "@/constants/fontsizes";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationType } from ".";
// Assets

const Jeu = () => {
	const navigation = useNavigation<NavigationType>();

	const handlePress = () => {
		navigation.navigate("index");
	};

	return (
		<View style={styles.wrapper}>
			<Card />
			<View style={styles.containerBackButton}>
				<TouchableOpacity onPress={handlePress} style={styles.backButton}>
					<Text style={styles.textBackButton}>Quitter</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	containerBackButton: {
		position: "absolute",
		bottom: 60,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	backButton: {
		paddingHorizontal: 50,
		paddingVertical: 20,
		borderRadius: 50,
		backgroundColor: colorWhite,
	},
	textBackButton: {
		fontSize: FontSize20,
		fontWeight: "bold",
	},
});

export default Jeu;
