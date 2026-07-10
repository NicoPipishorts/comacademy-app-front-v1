import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useForgotPasswordMutation } from "@/api/credentials/forgotPassword";
import { useLoginMutation } from "@/api/credentials/login";
import { useResetPasswordMutation } from "@/api/credentials/resetPassword";
import { sendAnalyticsEvent } from "@/api/analyticsEvents";
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
	getAuthUrl,
	getForgotPasswordUrl,
	getResetPasswordUrl,
} from "@/helpers/api/buildApiUrl";
import {
	parseResetPasswordDeepLink,
	processInitialDeepLink,
	subscribeToDeepLinks,
} from "@/src/utils/resetPasswordDeepLink";

const BIOMETRIC_AUTH_PAYLOAD_KEY = "auth.biometric.payload";
const BIOMETRIC_AUTH_HINT_KEY = "auth.biometric.hint";

const SignIn = () => {
	const insets = useSafeAreaInsets();
	const showSnackbar = useSnackbar();
	const navigation = useNavigation<NavigationType>();
	const authUrl = getAuthUrl();
	const forgotPasswordUrl = getForgotPasswordUrl();
	const resetPasswordUrl = getResetPasswordUrl();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [pendingResetCode, setPendingResetCode] = useState<string | null>(null);
	const [canUseBiometricLogin, setCanUseBiometricLogin] = useState(false);
	const [isBiometricLoading, setIsBiometricLoading] = useState(false);

	const forgotPasswordSheetRef = useRef<BottomSheetModal>(null);
	const resetPasswordSheetRef = useRef<BottomSheetModal>(null);
	const latestResetPasswordRef = useRef<string>("");
	const emailInputRef = useRef<TextInput>(null);
	const passwordInputRef = useRef<TextInput>(null);

	const { login, checkLoggedIn, setIsRegistering } = UseAuth();
	const biometricLabel = Platform.OS === "ios" ? "Face ID" : "biométrie";
	const biometricPrompt =
		Platform.OS === "ios"
			? "Authentifie-toi avec Face ID"
			: "Authentifie-toi pour te connecter";
	const isExpoGo =
		Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

	const toggleShowPassword = () => setShowPassword((v) => !v);

	const refreshBiometricAvailability = useCallback(async () => {
		try {
			if (isExpoGo) {
				setCanUseBiometricLogin(false);
				return;
			}

			const secureStoreAvailable = await SecureStore.isAvailableAsync();
			if (!secureStoreAvailable) {
				setCanUseBiometricLogin(false);
				return;
			}

			if (Platform.OS === "web" || !SecureStore.canUseBiometricAuthentication()) {
				setCanUseBiometricLogin(false);
				return;
			}

			const hasStoredHint = await SecureStore.getItemAsync(BIOMETRIC_AUTH_HINT_KEY);
			setCanUseBiometricLogin(Boolean(hasStoredHint));
		} catch {
			setCanUseBiometricLogin(false);
		}
	}, [isExpoGo]);

	const persistBiometricSession = useCallback(
		async (payload: AuthResponse, identifier: string) => {
			try {
				if (isExpoGo) return;

				const secureStoreAvailable = await SecureStore.isAvailableAsync();
				if (!secureStoreAvailable) return;
				if (Platform.OS === "web" || !SecureStore.canUseBiometricAuthentication()) {
					return;
				}

				await SecureStore.setItemAsync(
					BIOMETRIC_AUTH_PAYLOAD_KEY,
					JSON.stringify(payload),
					{
						requireAuthentication: true,
						authenticationPrompt: biometricPrompt,
					}
				);
				await SecureStore.setItemAsync(
					BIOMETRIC_AUTH_HINT_KEY,
					identifier.trim().toLowerCase()
				);
				setCanUseBiometricLogin(true);
			} catch (error) {
				console.error("Failed to persist biometric login payload", error);
			}
		},
		[biometricPrompt, isExpoGo]
	);

	const onSuccess = async (data: AuthResponse) => {
		await persistBiometricSession(data, email);
		await login(data);
		void sendAnalyticsEvent({
			eventName: "login_succeeded",
			authToken: data.jwt,
			userId: data.user.id,
			screenName: "SignIn",
			properties: { method: "password" },
		});
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

	const openResetPasswordSheetForDev = useCallback(() => {
		if (!__DEV__) return;
		Keyboard.dismiss();
		setPendingResetCode("dev-reset-code");
		latestResetPasswordRef.current = "";
		resetPasswordMutation.reset();
		requestAnimationFrame(() => {
			resetPasswordSheetRef.current?.present();
		});
	}, [resetPasswordMutation]);

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
		Keyboard.dismiss();
		loginMutation.mutate({ identifier: email, password });
	};

	const handleBiometricLogin = useCallback(async () => {
		if (isExpoGo) {
			showSnackbar(
				"Face ID n'est pas pris en charge dans Expo Go. Utilise un build développement ou production.",
				"error"
			);
			return;
		}

		setIsBiometricLoading(true);
		Keyboard.dismiss();
		try {
			const payloadRaw = await SecureStore.getItemAsync(BIOMETRIC_AUTH_PAYLOAD_KEY, {
				requireAuthentication: true,
				authenticationPrompt: biometricPrompt,
			});
			if (!payloadRaw) {
				await SecureStore.deleteItemAsync(BIOMETRIC_AUTH_HINT_KEY);
				setCanUseBiometricLogin(false);
				showSnackbar(
					"Aucune session biométrique enregistrée sur cet appareil.",
					"error"
				);
				return;
			}

			const payload = JSON.parse(payloadRaw) as AuthResponse;
			await login(payload);
			const sessionIsCurrent = await checkLoggedIn();
			if (!sessionIsCurrent) {
				throw new Error("La session Face ID n’est plus valide.");
			}
			void sendAnalyticsEvent({
				eventName: "login_succeeded",
				authToken: payload.jwt,
				userId: payload.user.id,
				screenName: "SignIn",
				properties: { method: "biometric" },
			});
			navigation.navigate("(tabs)");
		} catch (error) {
			showSnackbar(
				`Connexion ${biometricLabel} annulée ou indisponible.`,
				"error"
			);
			console.error("Biometric login failed", error);
		} finally {
			setIsBiometricLoading(false);
		}
	}, [
		biometricLabel,
		biometricPrompt,
		checkLoggedIn,
		isExpoGo,
		login,
		navigation,
		showSnackbar,
	]);

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

	useEffect(() => {
		void refreshBiometricAvailability();
	}, [refreshBiometricAvailability]);

	// Smoother on Android with "height"; iOS "padding" is fine
	const behavior = Platform.select({ ios: "padding", android: "height" }) as
		| "padding"
		| "height"
		| "position"
		| undefined;

	const bottomInset = Math.max(insets.bottom, 20);

	return (
		<>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={behavior}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
				<View style={styles.layout}>
					<View
						style={[
							styles.logoWrap,
							{
								paddingTop: Math.max(insets.top, 20) + 12,
							},
						]}>
					<LogoPageTop />
					</View>

					<ScrollView
						style={styles.formArea}
						contentContainerStyle={styles.formContent}
						keyboardShouldPersistTaps='handled'
						keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
						showsVerticalScrollIndicator={false}
						contentInsetAdjustmentBehavior='never'>
						<View style={styles.centerWrap}>
							<Text style={styles.title}>C'est bon de se revoir !</Text>

							<Pressable
								style={styles.inputField}
								onPress={() => emailInputRef.current?.focus()}>
								<TextInput
									ref={emailInputRef}
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
									onSubmitEditing={() => passwordInputRef.current?.focus()}
								/>
							</Pressable>

							<Pressable
								style={styles.inputField}
								onPress={() => passwordInputRef.current?.focus()}>
								<TextInput
									ref={passwordInputRef}
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
									onSubmitEditing={handleLogin}
								/>
								<Pressable
									hitSlop={10}
									onPress={toggleShowPassword}
									style={styles.eyeButton}>
									<MaterialCommunityIcons
										name={showPassword ? "eye-off" : "eye"}
										size={24}
										color={colorBlack}
									/>
								</Pressable>
							</Pressable>

							<View style={styles.forgotPasswordContainer}>
								<Pressable
									onPress={openForgotPasswordSheet}
									disabled={forgotPasswordMutation.isPending}
									hitSlop={6}>
									<Text style={styles.forgotPasswordText}>
										Mot de passe oublié ?
									</Text>
								</Pressable>
								{__DEV__ && (
									<Pressable onPress={openResetPasswordSheetForDev} hitSlop={6}>
										<Text style={styles.devResetPasswordText}>
											DEV: Ouvrir reset password sheet
										</Text>
									</Pressable>
								)}
							</View>

							<Pressable
								style={styles.buttonContainer}
								onPress={handleLogin}
								disabled={loginMutation.isPending}>
								{loginMutation.isPending ? (
									<ActivityIndicator color={colorWhite} />
								) : (
									<Text style={styles.buttonText}>Se connecter</Text>
								)}
							</Pressable>

							{canUseBiometricLogin && (
								<Pressable
									style={styles.biometricButton}
									onPress={handleBiometricLogin}
									disabled={isBiometricLoading}>
									{isBiometricLoading ? (
										<ActivityIndicator color={colorBlack} />
									) : (
										<>
											<MaterialCommunityIcons
												name={
													Platform.OS === "ios"
														? "face-recognition"
														: "fingerprint"
												}
												size={22}
												color={colorBlack}
											/>
											<Text style={styles.biometricButtonText}>
												Se connecter avec {biometricLabel}
											</Text>
										</>
									)}
								</Pressable>
							)}
						</View>
					</ScrollView>

					<View style={[styles.registerRow, { paddingBottom: bottomInset }]}>
						<Pressable
							hitSlop={8}
							onPress={() => {
								Keyboard.dismiss();
								requestAnimationFrame(() => setIsRegistering(true));
							}}>
							<Text style={styles.registerText}>
								Je n'ai pas de compte : S'inscrire
							</Text>
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>

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
		paddingHorizontal: 24,
		backgroundColor: "#F5F5F5",
	},
	layout: {
		flex: 1,
	},
	logoWrap: {
		width: "100%",
		alignItems: "center",
	},
	formArea: {
		flex: 1,
		width: "100%",
	},
	formContent: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	centerWrap: {
		alignItems: "center",
		width: "100%",
		maxWidth: 420,
	},
	title: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		marginBottom: 30,
		textAlign: "center",
	},
	inputField: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		minHeight: 58,
		borderRadius: 14,
		paddingHorizontal: 14,
		marginBottom: 14,
		borderWidth: 1,
		borderColor: colorGrey,
		backgroundColor: "#F5F5F5",
	},
	input: {
		flex: 1,
		backgroundColor: "transparent",
		color: colorBlack,
		fontSize: FontSize16,
		fontWeight: "700",
		paddingVertical: 14,
	},
	eyeButton: {
		paddingHorizontal: 4,
		paddingVertical: 8,
	},
	forgotPasswordContainer: {
		width: "100%",
		alignItems: "flex-end",
		marginBottom: 26,
		gap: 8,
	},
	forgotPasswordText: {
		fontWeight: "bold",
		color: colorBlack,
	},
	devResetPasswordText: {
		fontWeight: "700",
		fontSize: 12,
		color: colorBlack,
		opacity: 0.7,
	},
	buttonContainer: {
		backgroundColor: colorBlack,
		width: "100%",
		minHeight: 52,
		borderRadius: 26,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
		fontSize: FontSize16,
	},
	biometricButton: {
		marginTop: 14,
		width: "100%",
		minHeight: 52,
		borderRadius: 26,
		borderWidth: 1,
		borderColor: colorGrey,
		backgroundColor: "#F5F5F5",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 8,
	},
	biometricButtonText: {
		color: colorBlack,
		fontWeight: "700",
		fontSize: FontSize16,
	},
	registerRow: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 12,
	},
	registerText: {
		fontWeight: "bold",
		color: colorBlack,
	},
});

export default SignIn;
