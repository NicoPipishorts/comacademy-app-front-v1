import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSizeScreenTitles } from "../constants/fontsizes";

type Props = {
	content: string | undefined;
	type?: string;
	paddingTop?: number;
	paddingBottom?: number;
};

const ScreenHeaders = ({ content, type, paddingTop, paddingBottom }: Props) => {
	return (
		<View style={[{ paddingTop, paddingBottom }, styles.container]}>
			{type === "h2" && <Text style={styles.h2text}>{content}</Text>}
			{!type && <Text style={styles.mainText}>{content}</Text>}
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
	h2text: {
		fontWeight: "bold",
		fontSize: 26,
	},
});

export default ScreenHeaders;
