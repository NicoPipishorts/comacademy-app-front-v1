// File: src/components/cards/CommandementTitle.tsx
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	cardWidth: number;
	cardMargin: number;
	theme: string;
}

export default function CommandementTitleCard({
	cardWidth,
	cardMargin,
	theme,
}: Props) {
	return (
		<View
			style={[
				styles.outer,
				{ width: cardWidth, marginHorizontal: cardMargin },
			]}>
			<View style={styles.inner}>
				<Text style={styles.text}>{theme}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	outer: {
		justifyContent: "center",
		alignItems: "center",
	},
	inner: {
		width: "100%",
		minHeight: "70%",
		backgroundColor: colorBlack,
		paddingHorizontal: 24,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
		elevation: 5,
	},
	text: {
		color: colorWhite,
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		lineHeight: 44,
		textAlign: "center",
	},
});
