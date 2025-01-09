import { primaryBackground } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Feed = () => {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Welcome to the Feed!</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: primaryBackground,
	},
	text: {
		fontSize: 20,
		color: "#000",
	},
});

export default Feed;
