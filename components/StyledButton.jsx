import { FontSize12 } from "@/constants/fontsizes";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colorBlack, colorWhite } from "../constants/colors";

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
		borderColor: colorBlack,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colorWhite,
	},
	darkGenerique: {
		backgroundColor: colorBlack,
		borderColor: colorBlack,
	},
	text: {
		fontSize: FontSize12,
		color: colorBlack,
		fontWeight: "bold",
	},
	darkText: {
		color: "#FFF",
	},
});

export default StyledButton;
