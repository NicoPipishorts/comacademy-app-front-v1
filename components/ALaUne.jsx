import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const ALaUne = ({ title, link }) => {
	return (
		<TouchableOpacity style={styles.container}>
			<Text>A la une</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: { backgroundColor: "#FFF" },
});

export default ALaUne;
