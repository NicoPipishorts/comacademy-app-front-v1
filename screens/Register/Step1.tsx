import { UseAuth } from "@/auth/AuthContext";
import {
	colorBlack,
	colorGrey,
	colorRed,
	colorWhite,
} from "@/constants/colors";
import { FontSize12, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
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
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormPayload } from "./Register";

interface Props {
	setStep: Dispatch<SetStateAction<number>>;
	setFormPayload: Dispatch<SetStateAction<FormPayload>>;
	formPayload: FormPayload;
}

const NAME_ALLOWED_CHAR_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const NAME_SANITIZE_REGEX = /[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g;
const NAME_INVALID_CHAR_REGEX = /[^A-Za-zÀ-ÖØ-öø-ÿ' -]/;

const USERNAME_ALLOWED_CHAR_REGEX = /^[A-Za-z0-9._-]+$/;
const USERNAME_SANITIZE_REGEX = /[^A-Za-z0-9._-]/g;
const USERNAME_INVALID_CHAR_REGEX = /[^A-Za-z0-9._-]/;

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function RegisterStep1({
	setStep,
	formPayload,
	setFormPayload,
}: Props) {
	const insets = useSafeAreaInsets();
	const [firstName, setFirstName] = useState<string>(
		formPayload?.firstName || ""
	);
	const [lastName, setLastName] = useState<string>(formPayload?.lastName || "");
	const [username, setUsername] = useState<string>(formPayload?.username || "");
	const [email, setEmail] = useState<string>(formPayload?.email || "");
	const { setIsRegistering } = UseAuth();
	const firstNameInputRef = useRef<TextInput>(null);
	const lastNameInputRef = useRef<TextInput>(null);
	const usernameInputRef = useRef<TextInput>(null);
	const emailInputRef = useRef<TextInput>(null);
	const scrollViewRef = useRef<ScrollView>(null);
	const scrollOffsetRef = useRef(0);
	const keyboardHeightRef = useRef(0);
	const [keyboardInset, setKeyboardInset] = useState(0);

	const [errors, setErrors] = useState<{
		firstName: string | null;
		lastName: string | null;
		email: string | null;
		username: string | null;
	}>({
		firstName: null,
		lastName: null,
		email: null,
		username: null,
	});

	const updateFieldError = (
		field: "firstName" | "lastName" | "email" | "username",
		message: string | null
	) => {
		setErrors((prev) => ({ ...prev, [field]: message }));
	};

	const revalidateNameLikeFieldError = (
		field: "firstName" | "lastName" | "username",
		nextValue: string,
		requiredMessage: string
	) => {
		setErrors((prev) => {
			if (!prev[field]) return prev;
			const nextError = nextValue.trim().length === 0 ? requiredMessage : null;
			if (prev[field] === nextError) return prev;
			return { ...prev, [field]: nextError };
		});
	};

	const revalidateEmailError = (nextEmail: string) => {
		setErrors((prev) => {
			if (!prev.email) return prev;
			const trimmedEmail = nextEmail.trim();
			const nextError =
				trimmedEmail.length === 0
					? "Email est requis."
					: EMAIL_REGEX.test(trimmedEmail)
						? null
						: "Email n'est pas valide.";
			if (prev.email === nextError) return prev;
			return { ...prev, email: nextError };
		});
	};

	const validateForm = () => {
		let valid = true;
		const newErrors: {
			username: string | null;
			firstName: string | null;
			lastName: string | null;
			email: string | null;
		} = {
			username: null,
			firstName: null,
			lastName: null,
			email: null,
		};
		const cleanFirstName = firstName.trim();
		const cleanLastName = lastName.trim();
		const cleanUsername = username.trim();
		const cleanEmail = email.trim().toLowerCase();

		if (!cleanFirstName) {
			newErrors.firstName = "Prénom est requis.";
			valid = false;
		} else if (!NAME_ALLOWED_CHAR_REGEX.test(cleanFirstName)) {
			const invalidChar = cleanFirstName.match(NAME_INVALID_CHAR_REGEX)?.[0];
			newErrors.firstName = invalidChar
				? `Caractère non autorisé: "${invalidChar}".`
				: "Caractères autorisés: lettres, apostrophes, espaces et tirets.";
			valid = false;
		}

		if (!cleanLastName) {
			newErrors.lastName = "Nom est requis.";
			valid = false;
		} else if (!NAME_ALLOWED_CHAR_REGEX.test(cleanLastName)) {
			const invalidChar = cleanLastName.match(NAME_INVALID_CHAR_REGEX)?.[0];
			newErrors.lastName = invalidChar
				? `Caractère non autorisé: "${invalidChar}".`
				: "Caractères autorisés: lettres, apostrophes, espaces et tirets.";
			valid = false;
		}

		if (!cleanUsername) {
			newErrors.username = "Le pseudo est requis.";
			valid = false;
		} else if (!USERNAME_ALLOWED_CHAR_REGEX.test(cleanUsername)) {
			const invalidChar = cleanUsername.match(USERNAME_INVALID_CHAR_REGEX)?.[0];
			newErrors.username = invalidChar
				? `Caractère non autorisé: "${invalidChar}". Utilisez lettres, chiffres, point, underscore ou tiret.`
				: "Caractères autorisés: lettres, chiffres, point, underscore et tiret.";
			valid = false;
		}

		if (!cleanEmail) {
			newErrors.email = "Email est requis.";
			valid = false;
		} else if (!EMAIL_REGEX.test(cleanEmail)) {
			newErrors.email = "Email n'est pas valide.";
			valid = false;
		}

		setErrors(newErrors);
		return valid;
	};

	const handleNext = () => {
		if (validateForm()) {
			setErrors({
				firstName: null,
				lastName: null,
				email: null,
				username: null,
			});

			const nextPayload = {
				...(formPayload || ({} as FormPayload)),
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: email.trim().toLowerCase(),
				username: username.trim(),
			} as FormPayload;

			setFormPayload(nextPayload);
			setStep(2);
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

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
		},
		[]
	);

	const ensureInputVisible = useCallback((inputRef: React.RefObject<TextInput>) => {
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
	}, []);

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
		<KeyboardAvoidingView
			style={styles.avoidingContainer}
			behavior={behavior}
			keyboardVerticalOffset={keyboardOffset}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={{ flex: 1 }}>
					<ScrollView
						ref={scrollViewRef}
						contentContainerStyle={{
							flexGrow: 1,
							justifyContent: "center",
							paddingHorizontal: 10,
							paddingTop: 0,
							paddingBottom: bottomInset + 20 + keyboardInset + KEYBOARD_GAP,
						}}
						keyboardShouldPersistTaps='handled'
						showsVerticalScrollIndicator={false}
						onScroll={handleScroll}
						scrollEventThrottle={16}
						keyboardDismissMode={
							Platform.OS === "ios" ? "interactive" : "on-drag"
						}>
						<View style={styles.formContainer}>
							<View>
								<Text style={styles.title}>Venez com' vous êtes !</Text>
							</View>

							<View style={styles.fieldWrapper}>
								{errors.firstName ? (
									<View style={styles.errorTooltip}>
										<Text style={styles.errorTooltipText}>{errors.firstName}</Text>
									</View>
								) : null}
								<Pressable
									style={[
										styles.inputContainer,
										{
											borderColor: errors.firstName ? colorRed : colorGrey,
										},
									]}
									onPress={() => {
										firstNameInputRef.current?.focus();
										ensureInputVisible(firstNameInputRef);
									}}>
									<TextInput
										ref={firstNameInputRef}
										style={styles.input}
										onChangeText={(text) => {
											const sanitizedValue = text.replace(NAME_SANITIZE_REGEX, "");
											const invalidChar = text.match(NAME_INVALID_CHAR_REGEX)?.[0];
											if (invalidChar) {
												updateFieldError(
													"firstName",
													`Caractère non autorisé: "${invalidChar}".`
												);
											} else {
												revalidateNameLikeFieldError(
													"firstName",
													sanitizedValue,
													"Prénom est requis."
												);
											}
											setFirstName(sanitizedValue);
										}}
										value={firstName}
										placeholder='Prénom'
										placeholderTextColor={colorBlack}
										autoCapitalize='words'
										returnKeyType='next'
										blurOnSubmit={false}
										onFocus={() => ensureInputVisible(firstNameInputRef)}
										onSubmitEditing={() => lastNameInputRef.current?.focus()}
									/>
								</Pressable>
							</View>

							<View style={styles.fieldWrapper}>
								{errors.lastName ? (
									<View style={styles.errorTooltip}>
										<Text style={styles.errorTooltipText}>{errors.lastName}</Text>
									</View>
								) : null}
								<Pressable
									style={[
										styles.inputContainer,
										{ borderColor: errors.lastName ? colorRed : colorGrey },
									]}
									onPress={() => {
										lastNameInputRef.current?.focus();
										ensureInputVisible(lastNameInputRef);
									}}>
									<TextInput
										ref={lastNameInputRef}
										style={styles.input}
										onChangeText={(text) => {
											const sanitizedValue = text.replace(NAME_SANITIZE_REGEX, "");
											const invalidChar = text.match(NAME_INVALID_CHAR_REGEX)?.[0];
											if (invalidChar) {
												updateFieldError(
													"lastName",
													`Caractère non autorisé: "${invalidChar}".`
												);
											} else {
												revalidateNameLikeFieldError(
													"lastName",
													sanitizedValue,
													"Nom est requis."
												);
											}
											setLastName(sanitizedValue);
										}}
										value={lastName}
										placeholder='Nom'
										placeholderTextColor={colorBlack}
										autoCapitalize='words'
										returnKeyType='next'
										blurOnSubmit={false}
										onFocus={() => ensureInputVisible(lastNameInputRef)}
										onSubmitEditing={() => usernameInputRef.current?.focus()}
									/>
								</Pressable>
							</View>

							<View style={styles.fieldWrapper}>
								{errors.username ? (
									<View style={styles.errorTooltip}>
										<Text style={styles.errorTooltipText}>{errors.username}</Text>
									</View>
								) : null}
								<Pressable
									style={[
										styles.inputContainer,
										{ borderColor: errors.username ? colorRed : colorGrey },
									]}
									onPress={() => {
										usernameInputRef.current?.focus();
										ensureInputVisible(usernameInputRef);
									}}>
									<TextInput
										ref={usernameInputRef}
										style={styles.input}
										onChangeText={(text) => {
											const sanitizedValue = text.replace(
												USERNAME_SANITIZE_REGEX,
												""
											);
											const invalidChar =
												text.match(USERNAME_INVALID_CHAR_REGEX)?.[0];
											if (invalidChar) {
												updateFieldError(
													"username",
													`Caractère non autorisé: "${invalidChar}". Utilisez lettres, chiffres, point, underscore ou tiret.`
												);
											} else {
												revalidateNameLikeFieldError(
													"username",
													sanitizedValue,
													"Le pseudo est requis."
												);
											}
											setUsername(sanitizedValue);
										}}
										value={username}
										autoCorrect={false}
										placeholder='Pseudo'
										placeholderTextColor={colorBlack}
										autoCapitalize='none'
										returnKeyType='next'
										blurOnSubmit={false}
										onFocus={() => ensureInputVisible(usernameInputRef)}
										onSubmitEditing={() => emailInputRef.current?.focus()}
									/>
								</Pressable>
							</View>

							<View style={styles.fieldWrapper}>
								{errors.email ? (
									<View style={styles.errorTooltip}>
										<Text style={styles.errorTooltipText}>{errors.email}</Text>
									</View>
								) : null}
								<Pressable
									style={[
										styles.inputContainer,
										{ borderColor: errors.email ? colorRed : colorGrey },
									]}
									onPress={() => {
										emailInputRef.current?.focus();
										ensureInputVisible(emailInputRef);
									}}>
									<TextInput
										ref={emailInputRef}
										value={email}
										autoCorrect={false}
										onChangeText={(text) => {
											const normalizedEmail = text
												.replace(/\s+/g, "")
												.toLowerCase();
											revalidateEmailError(normalizedEmail);
											setEmail(normalizedEmail);
										}}
										style={styles.input}
										placeholder='Email'
										placeholderTextColor={colorBlack}
										keyboardType='email-address'
										textContentType='emailAddress'
										autoCapitalize='none'
										returnKeyType='done'
										onFocus={() => ensureInputVisible(emailInputRef)}
										onSubmitEditing={() => Keyboard.dismiss()}
									/>
								</Pressable>
							</View>
						</View>
						<Pressable style={styles.buttonContainer} onPress={handleNext}>
							<Text style={styles.buttonText}>Suivant</Text>
						</Pressable>

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
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	avoidingContainer: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},
	formContainer: {
		width: "100%",
		minWidth: "100%",
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		marginBottom: 40,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 14,
		paddingHorizontal: 14,
		marginBottom: 14,
		borderWidth: 1,
		width: "100%",
		minHeight: 56,
		backgroundColor: "#F5F5F5",
	},
	fieldWrapper: {
		width: "100%",
	},
	errorTooltip: {
		alignSelf: "flex-start",
		maxWidth: "100%",
		backgroundColor: colorBlack,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 6,
		marginBottom: 8,
	},
	errorTooltipText: {
		color: colorWhite,
		fontSize: FontSize12,
		textAlign: "left",
	},
	input: {
		flex: 1,
		backgroundColor: "transparent",
		color: colorBlack,
		fontSize: FontSize16,
		fontWeight: "bold",
		paddingVertical: 12,
	},
	buttonContainer: {
		backgroundColor: colorBlack,
		width: "100%",
		minHeight: 52,
		borderRadius: 26,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 10,
	},
	buttonText: {
		fontSize: FontSize16,
		color: colorWhite,
		fontWeight: "bold",
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
