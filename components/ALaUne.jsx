import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StyledButton from "../components/StyledButton";

const ALaUne = ({ content, link }) => {
	const handlePress = () => {
		console.log("Button pressed!");
	};
	return (
		<TouchableOpacity style={styles.container}>
			<Text style={styles.smallText}>A la une</Text>
			<View style={styles.containerBis}>
				<Text style={styles.mainText}>{content}</Text>
				<StyledButton
					title='Découvrir'
					handlePress={handlePress}
					variant='dark'
				/>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#FFF",
		width: "100%",
		minHeight: 100,
		padding: 15,
		borderRadius: 10,
		overflow: "hidden", // Added to ensure contents do not overflow visually
	},
	smallText: {
		fontSize: 12,
		fontWeight: "bold",
		paddingBottom: 15,
	},
	containerBis: {
		maxWidth: "94%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	mainText: {
		flex: 1,
		maxWidth: "70%",
		fontSize: 20,
		fontWeight: "bold",
	},
});

export default ALaUne;
