import { colorWhite } from "@/constants/colors";
import { FontSize12, FontSize20 } from "@/constants/fontsizes";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StyledButton from "./StyledButton";

type Props = {
	content: string;
	link?: string;
};

const ALaUne = ({ content, link }: Props) => {
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
		backgroundColor: colorWhite,
		width: 350,
		minHeight: 100,
		padding: 15,
		borderRadius: 10,
		marginBottom: 20,
	},
	smallText: {
		fontSize: FontSize12,
		fontWeight: "bold",
		paddingBottom: 15,
	},
	containerBis: {
		flex: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	mainText: {
		flex: 1,
		maxWidth: "65%",
		fontSize: FontSize20,
		fontWeight: "bold",
	},
});

export default ALaUne;
