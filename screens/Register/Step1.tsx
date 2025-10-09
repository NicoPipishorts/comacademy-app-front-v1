import { UseAuth } from "@/auth/AuthContext";
import {
	colorBlack,
	colorGrey,
	colorRed,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize12, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
	Image,
	Keyboard,
	KeyboardAvoidingView,
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

	// Validation error messages
	const [errors, setErrors] = useState<{
		firstName?: string | null;
		lastName?: string | null;
		email?: string | null;
		username?: string | null;
	}>({});

	const validateForm = () => {
		let valid = true;
		const newErrors: {
			username?: string;
			firstName?: string;
			lastName?: string;
			email?: string;
		} = {};

		// Regex for first name and last name (letters, accented, dashes, spaces)
		const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\- ]+$/;

		if (!firstName.trim()) {
			newErrors.firstName = "Prénom est requis.";
			valid = false;
		} else if (!nameRegex.test(firstName)) {
			newErrors.firstName =
				"Doit contenir des lettres, des tirets ou des espaces.";
			valid = false;
		}

		if (!lastName.trim()) {
			newErrors.lastName = "Nom est requis.";
			valid = false;
		} else if (!nameRegex.test(lastName)) {
			newErrors.lastName =
				"Doit contenir des lettres, des tirets ou des espaces.";
			valid = false;
		}

		const usernameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\-]+$/;
		if (!username.trim()) {
			newErrors.username = "Le pseudo est requis.";
			valid = false;
		} else if (!usernameRegex.test(username)) {
			newErrors.username = "Doit contenir lettres, chiffres ou tirets.";
			valid = false;
		}

		const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
		if (!email.trim()) {
			newErrors.email = "Email est requis.";
			valid = false;
		} else if (!emailRegex.test(email)) {
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
			setFormPayload({
				...formPayload,
				firstName,
				lastName,
				email,
				username,
			});
			setStep(2);
		}
	};

	const handleCancle = () => {
		setFormPayload(null as unknown as FormPayload);
		setIsRegistering(false);
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
						{ paddingTop: 20, paddingBottom: insets.bottom + 20 },
					]}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}>
					<View style={styles.container}>
						<View style={{ backgroundColor: primaryBackground }}>
							<Text style={styles.title}>Venez com' vous êtes !</Text>
						</View>

						{errors.firstName ? (
							<Text style={styles.errorText}>{errors.firstName}</Text>
						) : null}
						<View
							style={[
								styles.inputContainer,
								{ borderBottomColor: errors.firstName ? colorRed : colorGrey },
							]}>
							<TextInput
								style={styles.input}
								onChangeText={setFirstName}
								value={firstName}
								placeholder='Prénom'
								placeholderTextColor={colorBlack}
								autoCapitalize='words'
								returnKeyType='next'
							/>
						</View>

						{errors.lastName ? (
							<Text style={styles.errorText}>{errors.lastName}</Text>
						) : null}
						<View
							style={[
								styles.inputContainer,
								{ borderBottomColor: errors.lastName ? colorRed : colorGrey },
							]}>
							<TextInput
								style={styles.input}
								onChangeText={setLastName}
								value={lastName}
								placeholder='Nom'
								placeholderTextColor={colorBlack}
								autoCapitalize='words'
								returnKeyType='next'
							/>
						</View>

						{errors.username ? (
							<Text style={styles.errorText}>{errors.username}</Text>
						) : null}
						<View
							style={[
								styles.inputContainer,
								{ borderBottomColor: errors.username ? colorRed : colorGrey },
							]}>
							<TextInput
								style={styles.input}
								onChangeText={setUsername}
								value={username}
								autoCorrect={false}
								placeholder='Pseudo'
								placeholderTextColor={colorBlack}
								autoCapitalize='none'
								returnKeyType='next'
							/>
						</View>

						{errors.email ? (
							<Text style={styles.errorText}>{errors.email}</Text>
						) : null}
						<View
							style={[
								styles.inputContainer,
								{ borderBottomColor: errors.email ? colorRed : colorGrey },
							]}>
							<TextInput
								value={email}
								autoCorrect={false}
								onChangeText={(text) => setEmail(text.toLowerCase())}
								style={styles.input}
								placeholder='Email'
								placeholderTextColor={colorBlack}
								keyboardType='email-address'
								textContentType='emailAddress'
								autoCapitalize='none'
								returnKeyType='done'
							/>
						</View>

						<Pressable style={styles.buttonContainer} onPress={handleNext}>
							<Text style={styles.buttonText}>Suivant</Text>
							<View
								style={{
									justifyContent: "center",
									alignContent: "center",
									backgroundColor: colorBlack,
									borderRadius: 16,
									padding: 5,
									marginLeft: 10,
								}}>
								<Image
									source={require("@/assets/imgs/icons/chevron_white.png")}
									style={{
										width: 18,
										height: 18,
										transform: [{ rotate: "180deg" }],
										marginLeft: 2,
									}}
								/>
							</View>
						</Pressable>

						<Pressable style={styles.buttonRevenir} onPress={handleCancle}>
							<Text style={styles.buttonTextRevenir}>Annuler</Text>
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
	title: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		marginBottom: 40,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 20,
		borderWidth: 0,
		paddingBottom: 20,
		borderBottomWidth: 1,
		width: "100%",
	},
	input: {
		flex: 1,
		backgroundColor: "transparent",
		color: colorBlack,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	buttonContainer: {
		marginTop: 40,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colorWhite,
		padding: 10,
		paddingLeft: 20,
		borderRadius: 50,
	},
	buttonText: {
		fontSize: FontSize16,
		color: colorBlack,
		fontWeight: "bold",
	},
	buttonRevenir: {
		marginTop: 10,
		backgroundColor: colorBlack,
		paddingHorizontal: 24,
		paddingVertical: 8,
		borderRadius: 50,
	},
	buttonTextRevenir: {
		color: primaryBackground,
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
