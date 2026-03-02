import PasswordRequirements from "@/components/experience/passwordRequirements";
import PasswordStrengthMeter from "@/components/experience/passwordStrengthMeter";
import { UseAuth } from "@/auth/AuthContext";
import {
	colorBlack,
	colorGrey,
	colorRed,
	colorWhite,
	colorYellow,
} from "@/constants/colors";
import { FontSize12, FontSize16 } from "@/constants/fontsizes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
	Dimensions,
	Keyboard,
	KeyboardAvoidingView,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
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
	formPayload,
	setFormPayload,
	handleLogin,
}: Props) {
	const insets = useSafeAreaInsets();
	const [newPassword, setNewPassword] = useState<string>("");
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
	const [selectedOption, setSelectedOption] = useState<number | null>(null);
	const passwordInputRef = useRef<TextInput>(null);
	const scrollViewRef = useRef<ScrollView>(null);
	const scrollOffsetRef = useRef(0);
	const keyboardHeightRef = useRef(0);
	const [keyboardInset, setKeyboardInset] = useState(0);
	const { setIsRegistering } = UseAuth();

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

	const handleGoToLogin = () => {
		Keyboard.dismiss();
		setFormPayload(null as unknown as FormPayload);
		setIsRegistering(false);
	};

	const behavior = (Platform.OS === "ios" ? "padding" : "height") as
		| "padding"
		| "height"
		| "position"
		| undefined;
	const KEYBOARD_GAP = 16;

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
	};

	const ensureInputVisible = (inputRef: React.RefObject<TextInput>) => {
		requestAnimationFrame(() => {
			const keyboardHeight = keyboardHeightRef.current;
			if (!keyboardHeight) return;

			inputRef.current?.measureInWindow((_x, y, _width, height) => {
				const keyboardTop = Dimensions.get("window").height - keyboardHeight;
				const desiredBottom = keyboardTop - KEYBOARD_GAP;
				const fieldBottom = y + height;

				if (fieldBottom > desiredBottom) {
					const delta = fieldBottom - desiredBottom;
					scrollViewRef.current?.scrollTo({
						y: Math.max(0, scrollOffsetRef.current + delta),
						animated: true,
					});
				}
			});
		});
	};

	const bottomInset = Math.max(insets.bottom, 20);
	const keyboardOffset = 0;

	useEffect(() => {
		const showEvent =
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvent =
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

		const showSub = Keyboard.addListener(showEvent, (event) => {
			const height = event.endCoordinates?.height ?? 0;
			keyboardHeightRef.current = height;
			setKeyboardInset(height);
		});
		const hideSub = Keyboard.addListener(hideEvent, () => {
			keyboardHeightRef.current = 0;
			setKeyboardInset(0);
		});

		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, []);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<KeyboardAvoidingView
				style={styles.avoidingContainer}
				behavior={behavior}
				keyboardVerticalOffset={keyboardOffset}>
				<View style={{ flex: 1 }}>
					<ScrollView
						ref={scrollViewRef}
						style={styles.formScroll}
						contentContainerStyle={{
							flexGrow: 1,
							justifyContent: "center",
							paddingHorizontal: 10,
							paddingTop: 0,
							paddingBottom: bottomInset + 20 + keyboardInset + KEYBOARD_GAP,
						}}
						keyboardShouldPersistTaps='handled'
						keyboardDismissMode={
							Platform.OS === "ios" ? "interactive" : "on-drag"
						}
						bounces={false}
						overScrollMode='never'
						onScroll={handleScroll}
						scrollEventThrottle={16}
						showsVerticalScrollIndicator={false}>
						<View style={styles.formContainer}>
							{/* Options */}
							<View style={styles.optionsContainer}>
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
							<Pressable
								style={[
									styles.passwordInputContainer,
									{
										borderColor: errors.newPassword
											? colorRed
											: colorGrey,
									},
								]}
								onPress={() => {
									passwordInputRef.current?.focus();
									ensureInputVisible(passwordInputRef);
								}}>
								<TextInput
									ref={passwordInputRef}
									secureTextEntry={!showNewPassword}
									value={newPassword}
									onChangeText={setNewPassword}
									style={styles.input}
									placeholder='Mot de Passe'
									placeholderTextColor={colorBlack}
									returnKeyType='done'
									onFocus={() => ensureInputVisible(passwordInputRef)}
									onSubmitEditing={() => Keyboard.dismiss()}
								/>
								<Pressable
									hitSlop={10}
									onPress={toggleShowPassword}
									style={styles.eyeButton}>
									<MaterialCommunityIcons
										name={showNewPassword ? "eye-off" : "eye"}
										size={24}
										color={colorBlack}
										style={styles.eyeIcon}
									/>
								</Pressable>
							</Pressable>
							<Text style={styles.passwordHelperText}>
								Caractères autorisés: lettres, chiffres et @$!%*?&
							</Text>

							{/* Strength meter */}
							<PasswordStrengthMeter password={newPassword} />

							{/* Requirements */}
							<View style={styles.requirementsBlock}>
								<PasswordRequirements password={newPassword} />
							</View>

							<Pressable style={styles.buttonContainer} onPress={handleNext}>
								<Text style={styles.buttonText}>C'est parti</Text>
							</Pressable>
						</View>
					</ScrollView>

					<View style={[styles.loginRow, { paddingBottom: bottomInset }]}>
						<Text style={styles.loginText}>
							J&apos;ai déjà un compte :{" "}
							<Text style={styles.loginLinkText} onPress={handleGoToLogin}>
								ce connecter
							</Text>
						</Text>
					</View>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	avoidingContainer: {
		flex: 1, // KAV owns full height (no centering here)
		backgroundColor: "#F5F5F5",
	},
	formScroll: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},
	formContainer: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 10,
	},
	passwordInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 14,
		borderWidth: 1,
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderRadius: 14,
		width: "100%",
		minHeight: 56,
		backgroundColor: "#F5F5F5",
	},
	optionsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: 32,
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
		paddingVertical: 12,
	},
	eyeIcon: {
		marginLeft: 8,
	},
	eyeButton: {
		paddingHorizontal: 4,
		paddingVertical: 8,
	},
	passwordHelperText: {
		width: "100%",
		color: colorGrey,
		fontSize: FontSize12,
		marginTop: -14,
		marginBottom: 20,
	},
	requirementsBlock: {
		width: "100%",
		marginTop: -8,
	},
	buttonContainer: {
		backgroundColor: colorBlack,
		width: "100%",
		minHeight: 52,
		borderRadius: 26,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 32,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
		fontSize: FontSize16,
	},
	errorText: {
		minWidth: "100%",
		color: "red",
		fontSize: FontSize12,
		textAlign: "left",
		marginBottom: 5,
	},
	loginRow: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 12,
	},
	loginText: {
		fontWeight: "bold",
		color: colorBlack,
	},
	loginLinkText: {
		fontWeight: "bold",
		color: colorBlack,
	},
});
