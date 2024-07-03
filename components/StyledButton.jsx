import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { primaryColor } from "../constants/colors";

const StyledButton = ({ title, handlePress, variant }) => {
	// Conditionally set the style based on the 'dark' prop
	const buttonStyle =
		variant === "dark"
			? [styles.generique, styles.darkGenerique]
			: styles.generique;
	const textStyle =
		variant === "dark" ? [styles.text, styles.darkText] : styles.text;

	return (
		<TouchableOpacity style={buttonStyle} onPress={handlePress}>
			<Text style={textStyle}>{title}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	generique: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderWidth: 2,
		borderStyle: "solid",
		borderColor: primaryColor,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFF",
	},
	darkGenerique: {
		backgroundColor: primaryColor,
		borderColor: primaryColor,
	},
	text: {
		fontSize: 12,
		color: primaryColor,
		fontWeight: "bold",
	},
	darkText: {
		color: "#FFF",
	},
});

export default StyledButton;
