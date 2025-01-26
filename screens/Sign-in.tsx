import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useAuth } from "../auth/AuthContext";

// Import Assets
import { useLoginMutation } from "@/api/credentials/login";
import LogoPageTop from "@/components/headers/LogoPageTop";
import {
	colorBlack,
	colorDarkGrey,
	colorGrey,
	colorWhite,
} from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import { NavigationType } from "@/types/general";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SignIn = () => {
	const insets = useSafeAreaInsets();
	const showSnackbar = useSnackbar();
	const navigation = useNavigation<NavigationType>();
	const authUrl = process.env.EXPO_PUBLIC_AUTH_URL;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const { login, checkLoggedIn, setIsRegistering } = useAuth();

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const onSuccess = (data) => {
		login(data);
		navigation.navigate("(tabs)"); // Navigate to the home screen upon successful login
	};

	const onError = (error) => {
		showSnackbar(
			"Échec de la connexion. Veuillez vérifier vos identifiants et réessayer.",
			"error"
		);
	};

	const mutation = useLoginMutation(authUrl, onSuccess, onError);

	const handleLogin = () => {
		mutation.mutate({ identifier: email, password: password });
	};

	useEffect(() => {
		const checkIfLoggedIn = async () => {
			const loggedIn = await checkLoggedIn();
			if (loggedIn) {
				navigation.navigate("(tabs)");
			}
		};

		checkIfLoggedIn();
	}, [navigation, checkLoggedIn]);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={0} // Adjust this offset as needed
			>
				<ScrollView
					contentContainerStyle={[
						styles.scrollContainer,
						{ marginTop: insets.top },
					]}
					keyboardShouldPersistTaps='handled'>
					<LogoPageTop />
					<View
						style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
						<View>
							<Text style={styles.title}>C'est bon de se revoir !</Text>
						</View>
						<View style={styles.passwordInputContainer}>
							<TextInput
								style={styles.input}
								onChangeText={setEmail}
								value={email}
								autoCorrect={false}
								placeholder='Email'
								placeholderTextColor={colorBlack}
								autoCapitalize='none'
								keyboardType='email-address'
								textContentType='emailAddress'
							/>
						</View>
						<View style={styles.passwordInputContainer}>
							<TextInput
								secureTextEntry={!showPassword}
								value={password}
								autoCorrect={false}
								onChangeText={setPassword}
								style={styles.input}
								placeholder='Mot de Passe'
								placeholderTextColor={colorBlack}
								keyboardType='default'
								textContentType='password'
							/>
							<MaterialCommunityIcons
								name={showPassword ? "eye-off" : "eye"}
								size={24}
								color={colorBlack}
								style={styles.eyeIcon}
								onPress={toggleShowPassword}
							/>
						</View>
						<Pressable style={styles.containerForgot}>
							<Text style={styles.textForgot}>Mot de passe oublié?</Text>
						</Pressable>
						<Pressable style={styles.buttonContainer} onPress={handleLogin}>
							<Text style={styles.buttonText}>Se connecter</Text>
						</Pressable>
					</View>
				</ScrollView>
				<View
					style={{ flexDirection: "row", position: "absolute", bottom: 40 }}>
					<Text style={{ fontWeight: "bold" }}>Je n'ai pas de compte :</Text>
					<Pressable onPress={() => setIsRegistering(true)}>
						<Text style={{ fontWeight: "bold" }}> S'inscrire</Text>
					</Pressable>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "center",
		padding: 20,
	},

	scrollContainer: {
		flexGrow: 1,
		minWidth: "100%",
		justifyContent: "space-between",
		alignItems: "center",
	},

	logo: {
		width: 150,
		height: 60,
	},
	containerDots: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	dot: {
		width: 10,
		height: 10,
		marginHorizontal: 8,
		borderRadius: 50,
	},
	title: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		marginBottom: 40,
	},
	passwordInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 20,
		borderWidth: 0,
		paddingBottom: 16,
		borderBottomWidth: 2,
		borderBottomColor: colorGrey,
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
	containerForgot: {
		minWidth: "100%",
		justifyContent: "flex-end",
		alignItems: "flex-end",
		marginBottom: 50,
		paddingRight: 10,
	},
	textForgot: {
		color: colorDarkGrey,
		fontWeight: "bold",
		fontSize: FontSize14,
	},
	buttonContainer: {
		backgroundColor: colorBlack,
		paddingHorizontal: 50,
		paddingVertical: 15,
		color: colorWhite,
		fontWeight: "bold",
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});

export default SignIn;
