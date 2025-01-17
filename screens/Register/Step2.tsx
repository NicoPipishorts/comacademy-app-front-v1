import PasswordRequirements from "@/components/experience/passwordRequirements";
import PasswordStrengthMeter from "@/components/experience/passwordStrengthMetter";
import {
	colorBlack,
	colorGrey,
	colorRed,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import { FontSize12, FontSize16 } from "@/constants/fontsizes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { FormPayload } from "./Register";

interface Props {
	setStep: Dispatch<SetStateAction<number>>;
	setFormPayload: Dispatch<SetStateAction<FormPayload>>;
	formPayload: FormPayload;
	handleLogin: () => void;
}
const OPTIONS = [
	{ label: "Étudiant", value: "etudiant" },
	{ label: "Enseignant", value: "enseignant" },
	{ label: "Professionnelle", value: "professionnelle" },
	{ label: "Passionné", value: "passionne" },
];

export default function RegisterStep2({
	setStep,
	formPayload,
	setFormPayload,
	handleLogin,
}: Props) {
	const [newPassword, setNewPassword] = useState<string>("");
	const [passwordConfirm, setPasswordConfirm] = useState<string>("");
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
	const [showPasswordConfirm, setShowPasswordConfirm] =
		useState<boolean>(false);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);

	// Reset the registered values if available
	useEffect(() => {
		if (formPayload.profile !== null) {
			setSelectedOption(formPayload.profile);
		}
		if (formPayload.password !== null) {
			setNewPassword(formPayload.password);
			setPasswordConfirm(formPayload.password);
		}
	}, [formPayload]);

	const [errors, setErrors] = useState<{
		newPassword?: string;
		passwordConfirm?: string;
	}>({});

	const toggleShowPassword = (field: "new" | "confirm") => {
		if (field === "new") {
			setShowNewPassword(!showNewPassword);
		} else if (field === "confirm") {
			setShowPasswordConfirm(!showPasswordConfirm);
		}
	};

	const handleOptionPress = (option: string) => {
		if (selectedOption === option) {
			setSelectedOption(null);
		} else {
			setSelectedOption(option);
			setFormPayload({
				...formPayload,
				profile: option,
			});
		}
	};

	const validateForm = () => {
		let valid = true;
		const newErrors: {
			newPassword?: string;
			passwordConfirm?: string;
		} = {};

		const passwordRegex =
			/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
		// Validate new password
		// Validate new password
		if (!newPassword?.trim()) {
			newErrors.newPassword = "Nouveau mot de passe est requis.";
			valid = false;
		} else if (!passwordRegex.test(newPassword)) {
			newErrors.newPassword = "Le mot de passe n’est pas valide..";
			valid = false;
		}

		// Validate password confirmation
		if (!passwordConfirm?.trim()) {
			newErrors.passwordConfirm = "Confirmation du mot de passe est requise.";
			valid = false;
		} else if (newPassword !== passwordConfirm) {
			newErrors.passwordConfirm = "Les mots de passe ne correspondent pas.";
			valid = false;
		}

		setErrors(newErrors);
		return valid;
	};

	console.log(newPassword);

	const handleNext = () => {
		if (validateForm()) {
			// Update the form payload with the latest values
			const updatedPayload = {
				...formPayload,
				profile: selectedOption,
				password: newPassword,
			};

			// Set the updated payload in state
			setFormPayload(updatedPayload);

			// Proceed to the next step or login
			setErrors({});

			//Uncomment if login should happen here
			handleLogin();
		}
	};

	return (
		<>
			<View style={styles.container}>
				{/* Options */}
				<View style={styles.optionsContainer}>
					{OPTIONS.map((option, index) => (
						<TouchableOpacity
							key={option.value} // Use value as the key
							style={[
								styles.optionButton,
								selectedOption === option.value && styles.selectedOptionButton, // Compare using the value
							]}
							onPress={() => handleOptionPress(option.value)}>
							{/* Pass the value to the handler */}
							<Text
								style={[
									styles.optionText,
									selectedOption === option.value && styles.selectedOptionText, // Compare using the value
								]}>
								{option.label} {/* Display the label */}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* New Password Input */}
				{errors.newPassword && (
					<View>
						<Text style={styles.errorText}>{errors.newPassword}</Text>
					</View>
				)}
				<View
					style={[
						styles.passwordInputContainer,
						{
							borderBottomColor:
								errors.newPassword === undefined ? colorGrey : colorRed,
						},
					]}>
					<TextInput
						secureTextEntry={!showNewPassword}
						value={newPassword}
						onChangeText={setNewPassword}
						style={styles.input}
						placeholder='Nouveau Mot de Passe'
						placeholderTextColor={colorBlack}
					/>
					<MaterialCommunityIcons
						name={showNewPassword ? "eye-off" : "eye"}
						size={24}
						color={colorBlack}
						style={styles.eyeIcon}
						onPress={() => toggleShowPassword("new")}
					/>
				</View>

				{/* Password Strength Meter */}
				<PasswordStrengthMeter password={newPassword} />

				{/* Confirm Password Input */}
				{errors.passwordConfirm && (
					<View>
						<Text style={styles.errorText}>{errors.passwordConfirm}</Text>
					</View>
				)}
				<View
					style={[
						styles.passwordInputContainer,
						{
							borderBottomColor:
								errors.passwordConfirm === undefined ? colorGrey : colorRed,
						},
					]}>
					<TextInput
						secureTextEntry={!showPasswordConfirm}
						value={passwordConfirm}
						onChangeText={setPasswordConfirm}
						style={styles.input}
						placeholder='Confirmer le Mot de Passe'
						placeholderTextColor={colorBlack}
					/>
					<MaterialCommunityIcons
						name={showPasswordConfirm ? "eye-off" : "eye"}
						size={24}
						color={colorBlack}
						style={styles.eyeIcon}
						onPress={() => toggleShowPassword("confirm")}
					/>
				</View>

				{/* Password Requirements */}
				<PasswordRequirements />

				{/* Submit Button */}
				<Pressable style={styles.buttonSubmit} onPress={handleNext}>
					<Text style={styles.buttonTextSubmit}>C'est parti</Text>
				</Pressable>

				{/* Return Button */}
				<Pressable style={styles.buttonRevenir} onPress={() => setStep(1)}>
					<Text style={styles.buttonTextRevenir}>Revenir</Text>
				</Pressable>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	passwordInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
		borderWidth: 0,
		paddingBottom: 16,
		borderBottomWidth: 2,
	},
	optionsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: 40,
		backgroundColor: primaryBackground,
	},

	optionButton: {
		width: "48%",
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: colorGrey,
		borderRadius: 8,
		marginBottom: 8,
		alignItems: "center",
		backgroundColor: "#f9f9f9",
	},

	selectedOptionButton: {
		backgroundColor: colorYellow,
		borderColor: colorYellow,
	},
	optionText: {
		fontSize: 16,
		color: "#333",
	},
	selectedOptionText: {
		color: "#fff",
	},
	input: {
		flex: 1,
		backgroundColor: "transparent",
		color: colorBlack,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	eyeIcon: {
		marginLeft: 10,
	},
	buttonSubmit: {
		marginTop: 70,
		backgroundColor: colorBlack,
		paddingHorizontal: 50,
		paddingVertical: 15,
		borderRadius: 50,
	},
	buttonTextSubmit: {
		color: colorWhite,
		fontWeight: "bold",
	},
	buttonRevenir: {
		marginTop: 10,
		backgroundColor: primaryBackground,
		borderColor: colorBlack,
		borderWidth: 2,
		paddingHorizontal: 24,
		paddingVertical: 8,
		borderRadius: 50,
	},
	buttonTextRevenir: {
		color: colorBlack,
		fontWeight: "bold",
		fontSize: FontSize12,
	},
	errorText: {
		minWidth: "100%",
		color: "red",
		fontSize: FontSize12,
		textAlign: "left",
		marginBottom: 5,
	},
});
