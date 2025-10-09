import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Linking from "expo-linking";
import { useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

import { useForgotPasswordMutation } from "@/api/credentials/forgotPassword";
import { useLoginMutation } from "@/api/credentials/login";
import { useResetPasswordMutation } from "@/api/credentials/resetPassword";
import { UseAuth } from "@/auth/AuthContext";
import LogoPageTop from "@/components/headers/LogoPageTop";
import ForgotPasswordSheet from "@/components/modal/ForgotPasswordSheet";
import ResetPasswordSheet from "@/components/modal/ResetPasswordSheet";
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
	const forgotPasswordUrl = process.env.EXPO_PUBLIC_FORGOT_PASSWORD_URL;
	const resetPasswordUrl = process.env.EXPO_PUBLIC_RESET_PASSWORD_URL;

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [forgotPrefillEmail, setForgotPrefillEmail] = useState("");
	const [pendingResetCode, setPendingResetCode] = useState<string | null>(null);

	const forgotPasswordSheetRef = useRef<BottomSheetModal>(null);
	const resetPasswordSheetRef = useRef<BottomSheetModal>(null);
	const latestResetPasswordRef = useRef<string>("");

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

	const loginMutation = useLoginMutation(authUrl, onSuccess, onError);
	const forgotPasswordMutation = useForgotPasswordMutation(
		forgotPasswordUrl,
		() => {
			showSnackbar(
				"Si un compte est associé à cet email, un lien de réinitialisation a été envoyé.",
				"success"
			);
			setForgotPrefillEmail("");
			forgotPasswordSheetRef.current?.dismiss();
		},
		(error) => {
			const fallbackMessage =
				error instanceof Error && error.message
					? error.message
					: "Impossible d'envoyer le lien de réinitialisation. Réessayez ultérieurement.";
			showSnackbar(fallbackMessage, "error");
		}
	);

	const openForgotPasswordSheet = useCallback(() => {
		const trimmedEmail = email.trim();
		setForgotPrefillEmail(trimmedEmail);
		forgotPasswordMutation.reset();
		forgotPasswordSheetRef.current?.present();
	}, [email, forgotPasswordMutation]);

	const resetPasswordMutation = useResetPasswordMutation(
		resetPasswordUrl,
		() => {
			showSnackbar(
				"Ton mot de passe a bien été réinitialisé. Tu peux te connecter avec celui-ci.",
				"success"
			);
			const latestPassword = latestResetPasswordRef.current;
			if (latestPassword) {
				setPassword(latestPassword);
			}
			setPendingResetCode(null);
			resetPasswordSheetRef.current?.dismiss();
		},
		(error) => {
			const fallbackMessage =
				error instanceof Error && error.message
					? error.message
					: "Impossible de mettre à jour le mot de passe pour le moment.";
			showSnackbar(fallbackMessage, "error");
		}
	);

	const handleLogin = () => {
		loginMutation.mutate({ identifier: email, password });
	};

	const handleForgotPasswordSubmit = useCallback(
		(targetEmail: string) => {
			const trimmedEmail = targetEmail.trim();
			setForgotPrefillEmail(trimmedEmail);

			if (!trimmedEmail) {
				showSnackbar(
					"Veuillez renseigner votre adresse email avant de continuer.",
					"error"
				);
				return;
			}

			forgotPasswordMutation.mutate({ email: trimmedEmail });
		},
		[forgotPasswordMutation, showSnackbar]
	);

	const handleResetPasswordSubmit = useCallback(
		(payload: {
			password: string;
			passwordConfirmation: string;
			code: string;
		}) => {
			const { password: newPassword, passwordConfirmation, code } = payload;

			if (!code) {
				showSnackbar(
					"Le lien de réinitialisation est invalide ou expiré.",
					"error"
				);
				return;
			}

			latestResetPasswordRef.current = newPassword;
			setPendingResetCode(code);
			resetPasswordMutation.mutate({
				password: newPassword,
				passwordConfirmation,
				code,
			});
		},
		[resetPasswordMutation, showSnackbar]
	);

	const handleForgotSheetDismiss = useCallback(() => {
		setForgotPrefillEmail("");
		forgotPasswordMutation.reset();
	}, [forgotPasswordMutation]);

	const handleResetSheetDismiss = useCallback(() => {
		setPendingResetCode(null);
		resetPasswordMutation.reset();
		latestResetPasswordRef.current = "";
	}, [resetPasswordMutation]);

	const handleDeepLink = useCallback(
		(url: string | null) => {
			if (!url) return;

			const parsed = Linking.parse(url);
			const { path, queryParams } = parsed;
			const codeParam =
				typeof queryParams?.code === "string"
					? queryParams.code
					: typeof queryParams?.token === "string"
						? queryParams.token
						: typeof queryParams?.reset_code === "string"
							? queryParams.reset_code
							: null;

			if (!codeParam) return;

			const normalizedPath = path?.toLowerCase() ?? "";
			if (
				normalizedPath &&
				!normalizedPath.includes("reset-password") &&
				!normalizedPath.includes("password-reset")
			) {
				return;
			}

			if (typeof queryParams?.email === "string") {
				setEmail(queryParams.email);
			}

			setPendingResetCode(codeParam);
			resetPasswordMutation.reset();
			latestResetPasswordRef.current = "";
			resetPasswordSheetRef.current?.present();
		},
		[resetPasswordMutation]
	);

	useEffect(() => {
		const fetchInitialUrl = async () => {
			try {
				const initialUrl = await Linking.getInitialURL();
				handleDeepLink(initialUrl);
			} catch (error) {
				console.error("Failed to get initial URL", error);
			}
		};

		void fetchInitialUrl();

		const subscription = Linking.addEventListener("url", ({ url }) =>
			handleDeepLink(url)
		);

		return () => {
			subscription.remove();
		};
	}, [handleDeepLink]);

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
		<>
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

							<View style={styles.forgotPasswordContainer}>
								<Pressable
									onPress={openForgotPasswordSheet}
									disabled={forgotPasswordMutation.isPending}>
									<Text style={styles.forgotPasswordText}>
										Mot de passe oublié ?
									</Text>
								</Pressable>
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

			<ForgotPasswordSheet
				ref={forgotPasswordSheetRef}
				initialEmail={forgotPrefillEmail}
				isSubmitting={forgotPasswordMutation.isPending}
				onSubmit={handleForgotPasswordSubmit}
				onDismiss={handleForgotSheetDismiss}
			/>

			<ResetPasswordSheet
				ref={resetPasswordSheetRef}
				resetCode={pendingResetCode}
				isSubmitting={resetPasswordMutation.isPending}
				onSubmit={handleResetPasswordSubmit}
				onDismiss={handleResetSheetDismiss}
			/>
		</>
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
	forgotPasswordContainer: {
		width: "100%",
		alignItems: "flex-end",
		marginBottom: 30,
	},
	forgotPasswordText: {
		fontWeight: "bold",
		color: colorBlack,
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
