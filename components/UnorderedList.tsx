import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSize16 } from "../constants/fontsizes";

type Props = {
	array?: string;
};

const UnorderedList = ({ array }: Props) => {
	const isArray = Array.isArray(array);

	return (
		<View>
			{isArray ? (
				array.map((skill, index) => (
					<View key={index} style={styles.listItem}>
						<Text style={styles.bullet}>•</Text>
						<Text style={styles.itemText}>{skill}</Text>
					</View>
				))
			) : (
				<View style={styles.listItem}>
					<Text style={styles.itemText}>
						{array
							? typeof array === "string"
								? array
								: "Not a valid input"
							: "Input is null or undefined"}
					</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	listItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 10,
		paddingHorizontal: 30,
	},
	bullet: {
		marginRight: 10,
		fontWeight: "bold",
		fontSize: FontSize16,
	},
	itemText: {
		flex: 1,
		fontSize: FontSize16,
		lineHeight: 20,
	},
});

export default UnorderedList;
