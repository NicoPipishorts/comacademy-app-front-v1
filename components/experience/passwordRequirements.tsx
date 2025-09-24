import { colorDarkGrey, colorGreen } from "@/constants/colors";
import { getPasswordRequirements } from "@/helpers/passwordRequirement";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	password: string;
}

export default function PasswordRequirements({ password }: Props) {
	// Compute once per password change
	const req = getPasswordRequirements(password);

	const items = [
		{ key: "length", label: "Au moins 8 caractères" },
		{ key: "uppercase", label: "Une majuscule" },
		{ key: "lowercase", label: "Une minuscule" },
		{ key: "number", label: "Un chiffre" },
		{ key: "special", label: "Un caractère spécial (@$!%*?&)" },
	] as const;

	return (
		<View style={styles.requirementsContainer}>
			{items.map(({ key, label }) => (
				<Text
					key={key}
					style={[
						styles.requirementText,
						{ color: req[key] ? colorGreen : colorDarkGrey },
					]}>
					• {label}
				</Text>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	requirementsContainer: { alignSelf: "flex-start" },
	requirementText: { fontSize: 12, marginVertical: 2 },
});
