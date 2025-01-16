import { colorDarkGrey } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PasswordRequirements() {
	return (
		<>
			{/* Password Requirements */}
			<View style={styles.requirementsContainer}>
				<Text style={styles.requirementText}>Au moins 8 caractères</Text>
				<Text style={styles.requirementText}>Une majuscule</Text>
				<Text style={styles.requirementText}>Une minuscule</Text>
				<Text style={styles.requirementText}>Un chiffre</Text>
				<Text style={styles.requirementText}>
					Un caractère spécial (@$!%*?&)
				</Text>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	requirementsContainer: {
		marginBottom: 20,
		alignSelf: "flex-start",
	},
	requirementText: {
		fontSize: 12,
		marginVertical: 2,
		color: colorDarkGrey,
	},
});
