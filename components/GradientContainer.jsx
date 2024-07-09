import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colorWhite } from "../constants/colors";
import { FontSize16, FontSizeH2 } from "../constants/fontsizes";

const GradientContainer = ({ title, content, colors }) => {
	const renderContent = () => {
		if (Array.isArray(content)) {
			return (
				<View>
					{content.map((skill, index) => (
						<View key={index} style={styles.listItem}>
							<Text style={styles.bullet}>•</Text>
							<Text style={styles.itemText}>{skill}</Text>
						</View>
					))}
				</View>
			);
		} else {
			return <Text style={styles.containerText}>{content}</Text>;
		}
	};

	return (
		<LinearGradient colors={colors} style={styles.wrapper}>
			<View style={styles.containerTitles}>
				<Text style={styles.textTitles}>{title}</Text>
			</View>
			<View>{renderContent()}</View>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		marginVertical: 50,
		padding: 30,
	},
	containerTitles: {
		marginBottom: 20,
	},
	textTitles: {
		fontSize: FontSizeH2,
		fontWeight: "bold",
		textTransform: "uppercase",
		color: colorWhite,
	},
	containerText: {
		fontSize: FontSize16,
		lineHeight: 20,
		color: colorWhite,
	},
	listItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 10,
	},
	bullet: {
		marginRight: 10,
		fontWeight: "bold",
		fontSize: FontSize16,
		color: colorWhite,
	},
	itemText: {
		flex: 1,
		fontSize: FontSize16,
		lineHeight: 20,
		color: colorWhite,
	},
});

export default GradientContainer;
