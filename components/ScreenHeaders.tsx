import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSizeScreenTitles } from "../constants/fontsizes";

type Props = {
	content: string | undefined;
};

const ScreenHeaders = ({ content }: Props) => {
	return (
		<View style={styles.container}>
			<Text style={styles.mainText}>{content}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingVertical: 15,
		marginRight: 50,
	},
	mainText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
});

export default ScreenHeaders;
