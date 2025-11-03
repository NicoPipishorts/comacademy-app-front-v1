import React, { useEffect, useState } from "react";
import {
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
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
import { FontSize14, FontSize16 } from "@/constants/fontsizes";

// Import your feedback mutation hook
import { useSendFeedback } from "@/api/feedback/sendFeedback";
import useAuthSession from "@/hooks/useAuthSession";

const feedbackOptions = [
	{ label: "Une idée/envie", value: "improvement" },
	{ label: "Signaler un bug", value: "bug" },
	{ label: "Une remarque", value: "feedback" },
	{ label: "Autres", value: "feedback" },
];

export default function Feedback() {
	const [feedbackType, setFeedbackType] = useState<string | null>(null);
	const [message, setMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const { auth } = useAuthSession();
	const [isSending, setIsSending] = useState(false);

	// Initialize the mutation
	const { mutate: sendFeedback } = useSendFeedback(
		(data) => {
			setSuccessMessage(data.message);
			setFeedbackType(null);
			setMessage("");
			setIsSending(false);
		},
		(errorMsg) => {
			Alert.alert("Erreur", errorMsg);
		}
	);

	useEffect(() => {
		if (feedbackType === "bug") {
			setMessage(
				"Description du problème :\n\n\n Résultat attendu :\n\n\n Comment le reproduire :"
			);
		}
	}, [feedbackType]);

	const handleSubmit = () => {
		Keyboard.dismiss();
		const subject =
			feedbackOptions.find((o) => o.value === feedbackType)?.label || "";

		setIsSending(true);

		sendFeedback({
			userId: auth?.user.id,
			subject,
			message,
		});
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 10}
				style={styles.container}>
				<ScreenHeaders content='Feedback' />

				{successMessage ? (
					<View style={styles.successContainer}>
						<Text style={styles.successText}>{successMessage}</Text>
					</View>
				) : (
					<ScrollView keyboardShouldPersistTaps='handled'>
						<View style={styles.textContainer}>
							{[
								"Vous avez une idée, une envie?",
								"Une remarque?",
								"Un bug à signaler ?",
								"Faites-nous en part, nous serons ravis de vous lire.",
							].map((line, i) => (
								<Text key={i} style={styles.presentationText}>
									{line}
								</Text>
							))}

							<View style={styles.formContainer}>
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
									style={[
										styles.submitButton,
										(!feedbackType || !message || isSending) &&
											styles.disabledButton,
									]}
									onPress={handleSubmit}
									disabled={!feedbackType || !message || isSending}>
									<Text style={styles.submitButtonText}>
										{isSending ? "Envoi en cours..." : "Envoyer"}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				)}
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primaryBackground,
		paddingTop: 60,
		paddingHorizontal: 25,
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
	iconStyle: {
		width: 20,
		height: 20,
	},
	textarea: {
		borderRadius: 20,
		backgroundColor: colorWhite,
		padding: 20,
		height: 320,
		marginBottom: 20,
		fontSize: FontSize16,
		fontWeight: "bold",
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
	successContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	successText: {
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
	},
});
