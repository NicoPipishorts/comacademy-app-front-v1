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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLoginMutation } from "@/api/credentials/login";
import { UseAuth } from "@/auth/AuthContext";
import LogoPageTop from "@/components/headers/LogoPageTop";
import { colorBlack, colorGrey, colorWhite } from "@/constants/colors";
import { FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import { AuthResponse } from "@/types/credentials/auth";
import { NavigationType } from "@/types/general";

const SignIn = () => {
	const insets = useSafeAreaInsets();
	const showSnackbar = useSnackbar();
	const navigation = useNavigation<NavigationType>();
	const authUrl = process.env.EXPO_PUBLIC_AUTH_URL;

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const { login, checkLoggedIn, setIsRegistering } = UseAuth();

	const toggleShowPassword = () => setShowPassword((v) => !v);

	const onSuccess = async (data: AuthResponse) => {
		await login(data);
		navigation.navigate("(tabs)");
	};

	const onError = () => {
		showSnackbar(
			"Échec de la connexion. Veuillez vérifier vos identifiants et réessayer.",
			"error"
		);
	};

	const mutation = useLoginMutation(authUrl, onSuccess, onError);
	const handleLogin = () => {
		mutation.mutate({ identifier: email, password });
	};

	useEffect(() => {
		(async () => {
			const loggedIn = await checkLoggedIn();
			if (loggedIn) navigation.navigate("(tabs)");
		})();
	}, [navigation, checkLoggedIn]);

	const behavior = Platform.select({ ios: "padding", android: "padding" }) as
		| "padding"
		| "height"
		| "position"
		| undefined;

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={behavior}
				// Lift content just below the iOS notch/header; no offset for Android
				keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
				<ScrollView
					contentContainerStyle={[
						styles.scrollContainer,
						{ paddingTop: insets.top, paddingBottom: 120 },
					]}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
					// Helps Android not “fight” with SafeArea/Insets
					contentInsetAdjustmentBehavior='never'>
					<LogoPageTop />
					{/* Main content wrapper stays perfectly centered */}
					<View style={styles.centerWrap}>
						<Text style={styles.title}>C'est bon de se revoir !</Text>

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
								returnKeyType='next'
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
								returnKeyType='done'
							/>
							<MaterialCommunityIcons
								name={showPassword ? "eye-off" : "eye"}
								size={24}
								color={colorBlack}
								style={styles.eyeIcon}
								onPress={toggleShowPassword}
							/>
						</View>

						<Pressable style={styles.buttonContainer} onPress={handleLogin}>
							<Text style={styles.buttonText}>Se connecter</Text>
						</Pressable>
					</View>
				</ScrollView>

				{/* Bottom sticky register row – will rise above the keyboard on Android due to behavior="padding" */}
				<View
					style={[
						styles.registerRow,
						{ bottom: Math.max(insets.bottom, 20) + 20 },
					]}>
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
		// remove alignItems center here so ScrollView can use full width, we’ll center inner content
		paddingHorizontal: 20,
	},
	scrollContainer: {
		flexGrow: 1,
		minWidth: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	centerWrap: {
		// true vertical center for logo + text + form + button
		alignItems: "center",
		justifyContent: "center",
		gap: 0,
		width: "100%",
		marginTop: 40,
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
		borderBottomWidth: 2,
		borderBottomColor: colorGrey,
		paddingBottom: 16,
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
		backgroundColor: colorBlack,
		paddingHorizontal: 50,
		paddingVertical: 15,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
	registerRow: {
		position: "absolute",
		left: 20,
		right: 20,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
});

export default SignIn;
