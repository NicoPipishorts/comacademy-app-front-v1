import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSizeScreenTitles } from "../constants/fontsizes";

const ScreenHeaders = ({ content }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.mainText}>{content}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingVertical: 15,
	},
	mainText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
});

export default ScreenHeaders;
