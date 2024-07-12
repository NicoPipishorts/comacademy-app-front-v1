// src/screens/le_jue/ModalScreen.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const jeu = () => {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>This is a modal screen!</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		color: "white",
		fontSize: 24,
	},
});

export default jeu;
