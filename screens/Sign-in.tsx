import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";

import { useForgotPasswordMutation } from "@/api/credentials/forgotPassword";
import { useLoginMutation } from "@/api/credentials/login";
import { UseAuth } from "@/auth/AuthContext";
import ModalGestureLine from "@/components/experience/modalGestureLine";
import LogoPageTop from "@/components/headers/LogoPageTop";
import { colorBlack, colorGrey, colorWhite } from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
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

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ["45%"], []);

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
			setForgotPasswordEmail("");
			bottomSheetRef.current?.dismiss();
		},
		(error) => {
			const fallbackMessage =
				error instanceof Error && error.message
					? error.message
					: "Impossible d'envoyer le lien de réinitialisation. Réessayez ultérieurement.";
			showSnackbar(fallbackMessage, "error");
		}
	);

	const renderForgotBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior='close'
			/>
		),
		[]
	);

	const openForgotPasswordSheet = useCallback(() => {
		const trimmedEmail = email.trim();
		setForgotPasswordEmail(trimmedEmail);
		forgotPasswordMutation.reset();
		bottomSheetRef.current?.present();
	}, [email, forgotPasswordMutation]);

	const handleLogin = () => {
		loginMutation.mutate({ identifier: email, password });
	};

	const handleForgotPasswordSubmit = () => {
		const trimmedEmail = forgotPasswordEmail.trim();

		if (!trimmedEmail) {
			showSnackbar(
				"Veuillez renseigner votre adresse email avant de continuer.",
				"error"
			);
			return;
		}

		forgotPasswordMutation.mutate({ email: trimmedEmail });
	};

	const handleForgotPasswordDismiss = useCallback(() => {
		setForgotPasswordEmail("");
		forgotPasswordMutation.reset();
	}, [forgotPasswordMutation]);

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

			<BottomSheetModal
				ref={bottomSheetRef}
				index={0}
				snapPoints={snapPoints}
				backgroundStyle={styles.sheetBackground}
				handleIndicatorStyle={styles.hiddenIndicator}
				enablePanDownToClose
				onDismiss={handleForgotPasswordDismiss}
				backdropComponent={renderForgotBackdrop}>
				<BottomSheetView style={styles.sheetContent}>
					<ModalGestureLine />
					<Text style={styles.sheetTitle}>Mot de passe oublié</Text>
					<Text style={styles.sheetDescription}>
						Entrez l'email associé à votre compte pour recevoir un lien de
						réinitialisation.
					</Text>
					<TextInput
						style={styles.sheetInput}
						value={forgotPasswordEmail}
						onChangeText={setForgotPasswordEmail}
						placeholder='Email'
						placeholderTextColor={colorGrey}
						autoCapitalize='none'
						keyboardType='email-address'
						textContentType='emailAddress'
					/>
					<Pressable
						onPress={handleForgotPasswordSubmit}
						disabled={forgotPasswordMutation.isPending}
						style={[
							buttonBlack,
							forgotPasswordMutation.isPending && styles.resetButtonDisabled,
						]}>
						{forgotPasswordMutation.isPending ? (
							<ActivityIndicator color={colorWhite} />
						) : (
							<Text style={styles.resetButtonText}>Reset</Text>
						)}
					</Pressable>
				</BottomSheetView>
			</BottomSheetModal>
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
	sheetBackground: {
		backgroundColor: colorWhite,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	hiddenIndicator: {
		backgroundColor: "transparent",
	},
	sheetContent: {
		paddingHorizontal: 24,
		paddingTop: 8,
		paddingBottom: 24,
		gap: 20,
	},
	sheetTitle: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		color: colorBlack,
	},
	sheetDescription: {
		fontSize: FontSize16,
		color: colorBlack,
	},
	sheetInput: {
		width: "100%",
		borderWidth: 1,
		borderColor: colorGrey,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorBlack,
	},
	resetButton: {
		backgroundColor: colorBlack,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	resetButtonDisabled: {
		opacity: 0.6,
	},
	resetButtonText: {
		color: colorWhite,
		fontWeight: "bold",
		fontSize: FontSize16,
		textTransform: "uppercase",
	},
});

export default SignIn;
