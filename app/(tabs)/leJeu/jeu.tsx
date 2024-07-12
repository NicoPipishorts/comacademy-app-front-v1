import { primaryBackground } from "@/constants/colors";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationType } from ".";

const Jeu = () => {
	const navigation = useNavigation<NavigationType>();

	const handlePress = () => {
		navigation.navigate("index");
	};

	return (
		<View style={styles.wrapper}>
			<Text style={styles.text}>This is a modal screen!</Text>
			<TouchableOpacity onPress={handlePress}>
				<Text>Back</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
	},
	text: {
		color: "white",
		fontSize: 24,
	},
});

export default Jeu;
