import PasswordRequirements from "@/components/experience/passwordRequirements";
import PasswordStrengthMeter from "@/components/experience/passwordStrengthMeter";
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
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormPayload } from "./Register";

interface Props {
	setStep: Dispatch<SetStateAction<number>>;
	setFormPayload: Dispatch<SetStateAction<FormPayload>>;
	formPayload: FormPayload;
	handleLogin: (formPayload: FormPayload) => void;
}

const OPTIONS = [
	{ label: "Étudiant", value: 5 },
	{ label: "Enseignant", value: 6 },
	{ label: "Professionnel", value: 2 },
	{ label: "Passionné", value: 1 },
];

export default function RegisterStep2({
	setStep,
	formPayload,
	setFormPayload,
	handleLogin,
}: Props) {
	const insets = useSafeAreaInsets();
	const [newPassword, setNewPassword] = useState<string>("");
	const [passwordConfirm, setPasswordConfirm] = useState<string>("");
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
	const [showPasswordConfirm, setShowPasswordConfirm] =
		useState<boolean>(false);
	const [selectedOption, setSelectedOption] = useState<number | null>(null);

	useEffect(() => {
		if (formPayload.profile != null) setSelectedOption(formPayload.profile);
		if (formPayload.password != null) {
			setNewPassword(formPayload.password);
			setPasswordConfirm(formPayload.password);
		}
	}, [formPayload]);

	const [errors, setErrors] = useState<{
		newPassword?: string;
		passwordConfirm?: string;
		selectedOption?: string;
	}>({});

	const toggleShowPassword = (field: "new" | "confirm") => {
		if (field === "new") setShowNewPassword((v) => !v);
		else setShowPasswordConfirm((v) => !v);
	};

	const handleOptionPress = (option: number) => {
		if (selectedOption === option) {
			setSelectedOption(null);
			setFormPayload({ ...formPayload, profile: null });
		} else {
			setSelectedOption(option);
			setFormPayload({ ...formPayload, profile: option });
		}
	};

	const validateForm = () => {
		let valid = true;
		const newErrors: {
			newPassword?: string;
			passwordConfirm?: string;
			selectedOption?: string;
		} = {};

		const passwordRegex =
			/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

		if (!newPassword?.trim()) {
			newErrors.newPassword = "Nouveau mot de passe est requis.";
			valid = false;
		} else if (!passwordRegex.test(newPassword)) {
			newErrors.newPassword = "Le mot de passe n’est pas valide.";
			valid = false;
		}

		if (!passwordConfirm?.trim()) {
			newErrors.passwordConfirm = "Confirmation du mot de passe est requise.";
			valid = false;
		} else if (newPassword !== passwordConfirm) {
			newErrors.passwordConfirm = "Les mots de passe ne correspondent pas.";
			valid = false;
		}

		if (!selectedOption) {
			newErrors.selectedOption = "Un profil est requis";
			valid = false;
		}

		setErrors(newErrors);
		return valid;
	};

	const handleNext = () => {
		if (validateForm()) {
			const updatedPayload = {
				...formPayload,
				profile: selectedOption,
				password: newPassword,
			};
			setErrors({});
			handleLogin(updatedPayload);
		}
	};

	const behavior = Platform.select({ ios: "padding", android: "padding" }) as
		| "padding"
		| "height"
		| "position"
		| undefined;

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={behavior}
				keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
				<ScrollView
					contentContainerStyle={[
						styles.scrollContent,
						{ paddingTop: 20, paddingBottom: 120 },
					]}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}>
					<View style={styles.container}>
						{/* Options */}
						<View
							style={[
								styles.optionsContainer,
								{
									borderColor: errors.selectedOption
										? "rgba(199, 62, 48, .5)"
										: colorGrey,
									borderWidth: errors.selectedOption ? 2 : 1,
									borderRadius: 8,
								},
							]}>
							{OPTIONS.map((option) => (
								<TouchableOpacity
									key={`${option.label}-${option.value}`}
									style={[
										styles.optionButton,
										selectedOption === option.value &&
											styles.selectedOptionButton,
									]}
									onPress={() => handleOptionPress(option.value)}
									activeOpacity={0.8}>
									<Text
										style={[
											styles.optionText,
											selectedOption === option.value &&
												styles.selectedOptionText,
										]}>
										{option.label}
									</Text>
								</TouchableOpacity>
							))}
							{errors.selectedOption ? (
								<Text style={styles.errorText}>{errors.selectedOption}</Text>
							) : null}
						</View>

						{/* New Password */}
						{errors.newPassword ? (
							<Text style={styles.errorText}>{errors.newPassword}</Text>
						) : null}
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
								returnKeyType='next'
							/>
							<MaterialCommunityIcons
								name={showNewPassword ? "eye-off" : "eye"}
								size={24}
								color={colorBlack}
								style={styles.eyeIcon}
								onPress={() => toggleShowPassword("new")}
							/>
						</View>

						{/* Strength meter */}
						<PasswordStrengthMeter password={newPassword} />

						{/* Confirm Password */}
						{errors.passwordConfirm ? (
							<Text style={styles.errorText}>{errors.passwordConfirm}</Text>
						) : null}
						<View
							style={[
								styles.passwordInputContainer,
								{
									borderBottomColor: errors.passwordConfirm
										? colorRed
										: colorGrey,
								},
							]}>
							<TextInput
								secureTextEntry={!showPasswordConfirm}
								value={passwordConfirm}
								onChangeText={setPasswordConfirm}
								style={styles.input}
								placeholder='Confirmer le Mot de Passe'
								placeholderTextColor={colorBlack}
								returnKeyType='done'
							/>
							<MaterialCommunityIcons
								name={showPasswordConfirm ? "eye-off" : "eye"}
								size={24}
								color={colorBlack}
								style={styles.eyeIcon}
								onPress={() => toggleShowPassword("confirm")}
							/>
						</View>

						{/* Requirements */}
						<PasswordRequirements password={newPassword} />

						{/* Submit */}
						<Pressable style={styles.buttonSubmit} onPress={handleNext}>
							<Text style={styles.buttonTextSubmit}>C'est parti</Text>
						</Pressable>

						{/* Back */}
						<Pressable style={styles.buttonRevenir} onPress={() => setStep(1)}>
							<Text style={styles.buttonTextRevenir}>Revenir</Text>
						</Pressable>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		minWidth: "100%",
	},
	container: {
		width: "100%",
		alignItems: "center",
		paddingHorizontal: 10,
	},
	passwordInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
		borderWidth: 0,
		paddingBottom: 16,
		borderBottomWidth: 2,
		width: "100%",
	},
	optionsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		padding: 10,
		marginBottom: 40,
		backgroundColor: primaryBackground,
		width: "100%",
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
