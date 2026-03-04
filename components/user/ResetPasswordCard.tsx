import ChangePasswordSheet from "@/components/user/ChangePasswordSheet";
import { colorBlack, colorDarkGrey, colorWhite } from "@/constants/colors";
import { FontSize12, FontSize16 } from "@/constants/fontsizes";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ResetPasswordCard() {
	const [isPasswordSheetVisible, setIsPasswordSheetVisible] = useState(false);

	return (
		<>
			<View style={styles.card}>
				<View style={styles.textWrap}>
					<Text style={styles.title}>Mot de passe</Text>
					<Text style={styles.subtitle}>
						Mettre a jour vos identifiants de connexion.
					</Text>
				</View>
				<Pressable
					onPress={() => setIsPasswordSheetVisible(true)}
					style={styles.button}>
					<Text style={styles.buttonText}>Modifier</Text>
				</Pressable>
			</View>

			<ChangePasswordSheet
				visible={isPasswordSheetVisible}
				onClose={() => setIsPasswordSheetVisible(false)}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colorWhite,
		borderRadius: 25,
		paddingHorizontal: 16,
		paddingVertical: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 30,
	},
	textWrap: {
		flexShrink: 1,
		marginRight: 12,
	},
	title: {
		fontSize: FontSize16,
		fontWeight: "700",
		color: colorBlack,
	},
	subtitle: {
		fontSize: FontSize12,
		color: colorDarkGrey,
		marginTop: 2,
	},
	button: {
		backgroundColor: colorBlack,
		paddingHorizontal: 24,
		paddingVertical: 8,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
