import { UseAuth } from "@/auth/AuthContext";
import {
	colorBlack,
	colorGrey,
	colorRed,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize12, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import {
	CapitalizeFirstLetter,
	LowerCaseFirstLetter,
} from "@/helpers/capitalizeFirstLetter";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
	Image,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
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
	const [firstName, setFirstName] = useState<string>(formPayload?.firstName || "");
	const [lastName, setLastName] = useState<string>(formPayload?.lastName || "");
	const [username, setUsername] = useState<string>(formPayload?.username || "");
	const [email, setEmail] = useState<string>(formPayload?.email || "");
	const { setIsRegistering } = UseAuth();

	// Validation error messages
	const [errors, setErrors] = useState<{
		firstName?: string;
		lastName?: string;
		email?: string;
		username?: string;
	}>({
		firstName: undefined,
		lastName: undefined,
		email: undefined,
		username: undefined,
	});

	const validateForm = () => {
		let valid = true;
		const newErrors: {
			username?: string;
			firstName?: string;
			lastName?: string;
			email?: string;
		} = {};

		// Regex for first name and last name (allows letters, accented characters, dashes, and spaces)
		const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\- ]+$/;

		// Validate first name
		if (!firstName.trim()) {
			newErrors.firstName = "Prénom est requis.";
			valid = false;
		} else if (!nameRegex.test(firstName)) {
			newErrors.firstName =
				"Doit contenir que des lettres, des tirets ou des espaces.";
			valid = false;
		}

		// Validate last name
		if (!lastName.trim()) {
			newErrors.lastName = "Nom est requis.";
			valid = false;
		} else if (!nameRegex.test(lastName)) {
			newErrors.lastName =
				"Doit contenir que des lettres, des tirets ou des espaces.";
			valid = false;
		}

		// Validate last name

		const usernameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\-]+$/;
		if (!username.trim()) {
			newErrors.username = "Le pseudo est requis.";
			valid = false;
		} else if (!usernameRegex.test(username)) {
			newErrors.username =
				"Doit contenir que des lettres, des tirets ou des espaces.";
			valid = false;
		}

		// Validate email
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
			// Proceed to the next step
			setErrors({ firstName: null, lastName: null, email: null });
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
		setFormPayload(null);
		setIsRegistering(false);
	};

	return (
		<>
			<View style={styles.container}>
				<View
					style={{
						backgroundColor: primaryBackground,
					}}>
					<Text style={styles.title}>Venez com' vous êtes !</Text>
				</View>
				{errors.firstName && (
					<View>
						<Text style={styles.errorText}>{errors.firstName}</Text>
					</View>
				)}
				<View
					style={[
						styles.inputContainer,
						{
							borderBottomColor:
								errors.firstName === undefined ? colorGrey : colorRed,
						},
					]}>
					<TextInput
						style={styles.input}
						onChangeText={(text) => setFirstName(CapitalizeFirstLetter(text))}
						value={firstName}
						placeholder='Prénom'
						placeholderTextColor={colorBlack}
						autoCapitalize='none'
					/>
				</View>

				{errors.lastName && (
					<View>
						<Text style={styles.errorText}>{errors.lastName}</Text>
					</View>
				)}
				<View
					style={[
						styles.inputContainer,
						{
							borderBottomColor:
								errors.lastName === undefined ? colorGrey : colorRed,
						},
					]}>
					<TextInput
						style={styles.input}
						onChangeText={(text) => setLastName(CapitalizeFirstLetter(text))}
						value={lastName}
						placeholder='Nom'
						placeholderTextColor={colorBlack}
						autoCapitalize='none'
					/>
				</View>

				{errors.username && (
					<View>
						<Text style={styles.errorText}>{errors.username}</Text>
					</View>
				)}
				<View
					style={[
						styles.inputContainer,
						{
							borderBottomColor:
								errors.lastName === undefined ? colorGrey : colorRed,
						},
					]}>
					<TextInput
						style={styles.input}
						onChangeText={setUsername}
						value={username}
						autoCorrect={false}
						placeholder='Pseudo'
						placeholderTextColor={colorBlack}
						autoCapitalize='none'
					/>
				</View>

				{errors.email && (
					<View>
						<Text style={styles.errorText}>{errors.email}</Text>
					</View>
				)}
				<View
					style={[
						styles.inputContainer,
						{
							borderBottomColor:
								errors.lastName === undefined ? colorGrey : colorRed,
						},
					]}>
					<TextInput
						value={email}
						autoCorrect={false}
						onChangeText={(text) => setEmail(LowerCaseFirstLetter(text))}
						style={styles.input}
						placeholder='Email'
						placeholderTextColor={colorBlack}
						keyboardType='email-address'
						textContentType='emailAddress'
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

				{/* Return Button */}
				<Pressable style={styles.buttonRevenir} onPress={handleCancle}>
					<Text style={styles.buttonTextRevenir}>Annuler</Text>
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
		backgroundColor: primaryBackground,
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
