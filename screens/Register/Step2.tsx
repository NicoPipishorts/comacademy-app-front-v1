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
import { buttonBlack } from "@/constants/commonStyles";
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
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
	const [selectedOption, setSelectedOption] = useState<number | null>(null);

	useEffect(() => {
		if (formPayload?.profile != null) setSelectedOption(formPayload.profile);
		if (formPayload?.password != null) {
			setNewPassword(formPayload.password);
		}
	}, [formPayload]);

	const [errors, setErrors] = useState<{
		newPassword?: string;
		selectedOption?: string;
	}>({});

	const toggleShowPassword = () => setShowNewPassword((v) => !v);

	const handleOptionPress = (option: number) => {
		if (selectedOption === option) {
			setSelectedOption(null);
			setFormPayload({ ...formPayload, profile: null as unknown as number });
		} else {
			setSelectedOption(option);
			setFormPayload({ ...formPayload, profile: option });
		}
	};

	const validateForm = () => {
		let valid = true;
		const newErrors: {
			newPassword?: string;
			selectedOption?: string;
		} = {};

		const passwordRegex =
			/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

		if (!newPassword?.trim()) {
			newErrors.newPassword = "Nouveau mot de passe est requis.";
			valid = false;
		} else if (!passwordRegex.test(newPassword)) {
			newErrors.newPassword =
				"Utilisez 8+ caractères avec majuscule, minuscule, chiffre et @$!%*?&.";
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
				profile: selectedOption!,
				password: newPassword,
			};
			setErrors({});
			handleLogin(updatedPayload);
		}
	};

	const behavior = (Platform.OS === "ios" ? "padding" : "height") as
		| "padding"
		| "height"
		| "position"
		| undefined;

	const bottomInset = Math.max(insets.bottom, 20);
	// Align with Step1: offset accounts for top inset + approx header/logo height
	const keyboardOffset = (Platform.OS === "ios" ? insets.top : 0) + 80;

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<KeyboardAvoidingView
				style={styles.avoidingContainer}
				behavior={behavior}
				keyboardVerticalOffset={keyboardOffset}>
				<View style={{ flex: 1 }}>
					<ScrollView
						style={styles.formScroll}
						contentContainerStyle={{
							flexGrow: 1,
							paddingHorizontal: 10,
							paddingTop: 0,
							// keep footer tappable when keyboard is open
							paddingBottom: bottomInset + 20,
						}}
						keyboardShouldPersistTaps='never'
						keyboardDismissMode={Platform.OS === "ios" ? "on-drag" : "on-drag"}
						bounces={false}
						overScrollMode='never'
						showsVerticalScrollIndicator={false}>
						<View style={styles.formContainer}>
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
										borderBottomColor: errors.newPassword
											? colorRed
											: colorGrey,
									},
								]}>
								<TextInput
									secureTextEntry={!showNewPassword}
									value={newPassword}
									onChangeText={setNewPassword}
									style={styles.input}
									placeholder='Mot de Passe'
									placeholderTextColor={colorBlack}
									returnKeyType='done'
								/>
								<MaterialCommunityIcons
									name={showNewPassword ? "eye-off" : "eye"}
									size={24}
									color={colorBlack}
									style={styles.eyeIcon}
									onPress={toggleShowPassword}
								/>
							</View>
							<Text style={styles.passwordHelperText}>
								Caractères autorisés: lettres, chiffres et @$!%*?&
							</Text>

							{/* Strength meter */}
							<PasswordStrengthMeter password={newPassword} />

							{/* Requirements */}
							<PasswordRequirements password={newPassword} />
						</View>

						<View style={styles.footer}>
							<Pressable style={buttonBlack} onPress={handleNext}>
								<Text style={styles.buttonTextSubmit}>C'est parti</Text>
							</Pressable>

							<Pressable
								style={styles.buttonRevenir}
								onPress={() => setStep(1)}>
								<Text style={styles.buttonTextRevenir}>Revenir</Text>
							</Pressable>
						</View>
					</ScrollView>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	avoidingContainer: {
		flex: 1, // KAV owns full height (no centering here)
	},
	formScroll: {
		flex: 1,
	},
	formContainer: {
		width: "100%",
		alignItems: "center",
		paddingHorizontal: 10,
	},
	footer: {
		paddingHorizontal: 10,
		paddingTop: 24,
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
	passwordHelperText: {
		width: "100%",
		color: colorGrey,
		fontSize: FontSize12,
		marginTop: -14,
		marginBottom: 14,
	},
	buttonSubmit: {
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
		alignSelf: "center",
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
