// src/screens/Feedback.tsx

import React, { useEffect, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import ScreenHeaders from "@/components/ScreenHeaders";
import {
	colorBlack,
	colorDarkGrey,
	colorLightGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14 } from "@/constants/fontsizes";

const feedbackOptions = [
	{ label: "Idée d'amélioration", value: "improvement" },
	{ label: "Retour d'expérience", value: "feedback" },
	{ label: "Signaler un bug", value: "bug" },
];

export default function Feedback() {
	const [feedbackType, setFeedbackType] = useState<string | null>(null);
	const [message, setMessage] = useState("");

	const handleSubmit = () => {
		Alert.alert("Merci !", "Votre retour a bien été envoyé.");
		setFeedbackType(null);
		setMessage("");
	};

	useEffect(() => {
		if (feedbackType === "bug") {
			setMessage(
				"Description du problème :\n\n\n Rsultat attendu :\n\n\n Comment le reproduire :"
			);
		}
	}, [feedbackType]);

	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Feedback' />

			<View style={styles.textContainer}>
				{[
					"Vous avez une idée d’amélioration ?",
					"Un retour d’expérience ?",
					"Un bug à signaler ?",
					"Faites-nous en part, nous serons ravis de vous lire.",
				].map((line, i) => (
					<Text key={i} style={styles.presentationText}>
						{line}
					</Text>
				))}

				<KeyboardAvoidingView
					behavior={Platform.select({ ios: "padding", android: undefined })}
					style={styles.formContainer}>
					<Dropdown
						data={feedbackOptions}
						labelField='label'
						valueField='value'
						placeholder='Sélectionnez un type de retour'
						value={feedbackType}
						onChange={(item) => setFeedbackType(item.value)}
						style={styles.dropdownBox}
						containerStyle={styles.dropdownList}
						placeholderStyle={styles.placeholderStyle}
						selectedTextStyle={styles.selectedTextStyle}
						itemTextStyle={styles.itemTextStyle}
						iconStyle={styles.iconStyle}
						activeColor={colorLightGrey}
					/>

					<TextInput
						style={styles.textarea}
						multiline
						placeholder='Votre message…'
						value={message}
						onChangeText={setMessage}
						textAlignVertical='top'
					/>

					<TouchableOpacity
						style={[styles.submitButton]}
						onPress={handleSubmit}
						disabled={!feedbackType || !message}>
						<Text style={styles.submitButtonText}>Envoyer</Text>
					</TouchableOpacity>
				</KeyboardAvoidingView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
		padding: 25,
		marginTop: 40,
	},
	textContainer: {
		marginVertical: 10,
	},
	presentationText: {
		fontSize: FontSize14,
		fontWeight: "bold",
		marginBottom: 4,
	},
	formContainer: {
		marginTop: 20,
	},
	dropdownBox: {
		marginBottom: 20,
		borderRadius: 20,
		backgroundColor: colorWhite,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderWidth: 0,
	},
	dropdownList: {
		marginTop: 10,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colorDarkGrey,
		backgroundColor: colorWhite,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 5,
		overflow: "hidden",
	},
	placeholderStyle: {
		color: colorDarkGrey,
	},
	selectedTextStyle: {
		fontSize: 16,
		fontWeight: "bold",
		color: colorBlack,
	},
	itemTextStyle: {
		fontSize: 16,
	},
	activeColor: {
		color: colorBlack,
	},
	iconStyle: {
		width: 20,
		height: 20,
	},
	textarea: {
		borderRadius: 20,
		backgroundColor: colorWhite,
		padding: 20,
		minHeight: 320,
		marginBottom: 20,
	},
	submitButton: {
		backgroundColor: colorBlack,
		paddingVertical: 15,
		borderRadius: 50,
		alignItems: "center",
	},
	disabledButton: {
		backgroundColor: colorDarkGrey,
	},
	submitButtonText: {
		color: colorWhite,
		fontWeight: "bold",
		fontSize: 16,
	},
});
