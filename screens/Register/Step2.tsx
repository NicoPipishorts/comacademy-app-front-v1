import PasswordRequirements from "@/components/experience/passwordRequirements";
import PasswordStrengthMeter from "@/components/experience/passwordStrengthMetter";
import {
	colorBlack,
	colorGrey,
	colorRed,
	colorWhite,
	colorYellow,
} from "@/constants/colors";
import { FontSize12, FontSize16 } from "@/constants/fontsizes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useState } from "react";
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
}

const OPTIONS = ["Étudiant", "Enseignant", "Professionnel", "Passionné"];

export default function RegisterStep2({
	setStep,
	formPayload,
	setFormPayload,
}: Props) {
	const [newPassword, setNewPassword] = useState<string>("");
	const [passwordConfirm, setPasswordConfirm] = useState<string>("");
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
	const [showPasswordConfirm, setShowPasswordConfirm] =
		useState<boolean>(false);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);

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
		}
	};

	const validateForm = () => {
		let valid = true;
		const newErrors: {
			newPassword?: string;
			passwordConfirm?: string;
		} = {};

		// Validate new password
		if (!newPassword.trim()) {
			newErrors.newPassword = "Nouveau mot de passe est requis.";
			valid = false;
		}

		// Validate password confirmation
		if (!passwordConfirm.trim()) {
			newErrors.passwordConfirm = "Confirmation du mot de passe est requise.";
			valid = false;
		} else if (newPassword !== passwordConfirm) {
			newErrors.passwordConfirm = "Les mots de passe ne correspondent pas.";
			valid = false;
		}

		setErrors(newErrors);
		return valid;
	};

	const handleNext = () => {
		if (validateForm()) {
			// Proceed to the next step
			setErrors({});

			setFormPayload({
				...formPayload,
				profile: selectedOption,
				password: newPassword,
			});
		}
	};

	return (
		<>
			<View style={styles.container}>
				{/* Options */}
				<View style={styles.optionsContainer}>
					{OPTIONS.map((option, index) => (
						<TouchableOpacity
							key={option}
							style={[
								styles.optionButton,
								selectedOption === option && styles.selectedOptionButton,
							]}
							onPress={() => handleOptionPress(option)}>
							<Text
								style={[
									styles.optionText,
									selectedOption === option && styles.selectedOptionText,
								]}>
								{option}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* New Password Input */}
				<View
					style={[
						styles.passwordInputContainer,
						{
							borderBottomColor: errors.newPassword ? colorRed : colorGrey,
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
				{errors.newPassword && (
					<View>
						<Text style={styles.errorText}>{errors.newPassword}</Text>
					</View>
				)}

				{/* Password Strength Meter */}
				<PasswordStrengthMeter password={newPassword} />

				{/* Confirm Password Input */}
				<View
					style={[
						styles.passwordInputContainer,
						{
							borderBottomColor: errors.passwordConfirm ? colorRed : colorGrey,
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
				{errors.passwordConfirm && (
					<View>
						<Text style={styles.errorText}>{errors.passwordConfirm}</Text>
					</View>
				)}

				{/* Password Requirements */}
				<PasswordRequirements />

				{/* Submit Button */}
				<Pressable style={styles.buttonContainer} onPress={handleNext}>
					<Text style={styles.buttonText}>C'est parti</Text>
				</Pressable>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
	buttonContainer: {
		marginTop: 80,
		backgroundColor: colorBlack,
		paddingHorizontal: 50,
		paddingVertical: 15,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
	errorText: {
		color: "red",
		fontSize: FontSize12,
		textAlign: "left",
		width: "100%",
		marginBottom: 5,
	},
});
