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
import {
	parseResetPasswordDeepLink,
	processInitialDeepLink,
	subscribeToDeepLinks,
} from "@/src/utils/resetPasswordDeepLink";

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
	const [pendingResetCode, setPendingResetCode] = useState<string | null>(null);
	const [keyboardVisible, setKeyboardVisible] = useState(false);

	const forgotPasswordSheetRef = useRef<BottomSheetModal>(null);
	const resetPasswordSheetRef = useRef<BottomSheetModal>(null);
	const latestResetPasswordRef = useRef<string>("");

	const { login, checkLoggedIn, setIsRegistering } = UseAuth();

	const toggleShowPassword = () => setShowPassword((v) => !v);

	const onSuccess = async (data: AuthResponse) => {
		await login(data);
		navigation.navigate("(tabs)");
	};

	const onError = (error: any) => {
		showSnackbar(
			"Échec de la connexion. Veuillez vérifier vos identifiants et réessayer.",
			"error",
			{
				debugInfo: {
					url: authUrl,
					statusCode: error?.response?.status,
					statusText: error?.response?.statusText,
					errorMessage: error?.message,
					timestamp: new Date().toISOString(),
				},
			}
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
		forgotPasswordMutation.reset();
		// Close keyboard first, then present sheet on next frame to avoid race
		Keyboard.dismiss();
		requestAnimationFrame(() => {
			forgotPasswordSheetRef.current?.present();
		});
	}, [forgotPasswordMutation]);

	const resetPasswordMutation = useResetPasswordMutation(
		resetPasswordUrl,
		() => {
			showSnackbar(
				"Ton mot de passe a bien été réinitialisé. Tu peux te connecter avec celui-ci.",
				"success"
			);
			const latestPassword = latestResetPasswordRef.current;
			if (latestPassword) setPassword(latestPassword);
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
		forgotPasswordMutation.reset();
	}, [forgotPasswordMutation]);

	const handleResetSheetDismiss = useCallback(() => {
		setPendingResetCode(null);
		resetPasswordMutation.reset();
		latestResetPasswordRef.current = "";
	}, [resetPasswordMutation]);

	const handleDeepLink = useCallback((url: string | null) => {
		const payload = parseResetPasswordDeepLink(url);
		if (!payload) return;

		if (payload.email) {
			setEmail(payload.email);
		}

		setPendingResetCode(payload.code);
		latestResetPasswordRef.current = "";
		// Close keyboard before presenting the reset sheet
		Keyboard.dismiss();
		requestAnimationFrame(() => {
			resetPasswordSheetRef.current?.present();
		});
	}, []);

	useEffect(() => {
		void processInitialDeepLink({
			getInitialUrl: Linking.getInitialURL,
			onUrl: handleDeepLink,
			onError: (error) => {
				console.error("Failed to get initial URL", error);
			},
		});

		const subscription = subscribeToDeepLinks({
			addUrlListener: (handler) => Linking.addEventListener("url", handler),
			onUrl: handleDeepLink,
		});

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

	// Smoother on Android with "height"; iOS "padding" is fine
	const behavior = Platform.select({ ios: "padding", android: "height" }) as
		| "padding"
		| "height"
		| "position"
		| undefined;

	const bottomInset = Math.max(insets.bottom, 20);

	useEffect(() => {
		const showEvt =
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvt =
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
		const subShow = Keyboard.addListener(showEvt, () =>
			setKeyboardVisible(true)
		);
		const subHide = Keyboard.addListener(hideEvt, () =>
			setKeyboardVisible(false)
		);
		return () => {
			subShow.remove();
			subHide.remove();
		};
	}, []);

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<KeyboardAvoidingView
					style={styles.container}
					behavior={behavior}
					keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
					<ScrollView
						contentContainerStyle={[
							styles.scrollContainer,
							{
								paddingTop: Math.max(insets.top, 20),
								// remove extra bottom padding while keyboard is visible to avoid big gap
								paddingBottom: bottomInset + (keyboardVisible ? 0 : 80),
							},
						]}
						keyboardShouldPersistTaps='never'
						keyboardDismissMode={Platform.OS === "ios" ? "on-drag" : "on-drag"}
						showsVerticalScrollIndicator={false}
						contentInsetAdjustmentBehavior='never'>
						<LogoPageTop />

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
									onSubmitEditing={() => Keyboard.dismiss()}
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
									onSubmitEditing={() => Keyboard.dismiss()}
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

					<View style={[styles.registerRow, { bottom: bottomInset }]}>
						<Pressable
							onPress={() => {
								Keyboard.dismiss();
								requestAnimationFrame(() => setIsRegistering(true));
							}}>
							<Text style={{ fontWeight: "bold" }}>
								Je n'ai pas de compte : S'inscrire
							</Text>
						</Pressable>
					</View>
				</KeyboardAvoidingView>
			</TouchableWithoutFeedback>

			<ForgotPasswordSheet
				ref={forgotPasswordSheetRef}
				initialEmail={email}
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
		paddingHorizontal: 20,
	},
	scrollContainer: {
		flexGrow: 1,
		minWidth: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	centerWrap: {
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
