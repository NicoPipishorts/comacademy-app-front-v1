import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

// Import Assets
import { sendAnalyticsEvent } from "@/api/analyticsEvents";
import { useRegisterNewUser } from "@/api/credentials/registerNewUser";
import { UseAuth } from "@/auth/AuthContext";
import LogoPageTop from "@/components/headers/LogoPageTop";
import { AuthResponse } from "@/types/credentials/auth";
import { NavigationType } from "@/types/general";
import axios, { AxiosError } from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RegisterStep1 from "./Step1";
import RegisterStep2 from "./Step2";

export interface FormPayload {
	firstName: string;
	lastName: string;
	email: string;
	profile: number;
	password: string;
	username: string;
}

const Register = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const { login, checkLoggedIn } = UseAuth();
	const [formPayload, setFormPayload] = useState<FormPayload>();
	const [step, setStep] = useState<number>(1);

	const onSuccess = async (data: AuthResponse) => {
		await login(data);
		void sendAnalyticsEvent({
			eventName: "signup_completed",
			authToken: data.jwt,
			userId: data.user.id,
			screenName: "Register",
			properties: {
				profile: formPayload?.profile ?? null,
			},
		});
		navigation.navigate("(tabs)");
	};

	const onError = (error: AxiosError | Error) => {
		const backendMessage = axios.isAxiosError(error)
			? ((error.response?.data as { error?: { message?: string } } | undefined)
					?.error?.message ??
			  error.message)
			: error.message;

		const normalizedMessage =
			typeof backendMessage === "string" && backendMessage.trim()
				? backendMessage.trim()
				: "Une erreur est survenue pendant l'inscription.";
		const loweredMessage = normalizedMessage.toLowerCase();

		if (
			loweredMessage.includes("already") &&
			(loweredMessage.includes("email") || loweredMessage.includes("username"))
		) {
			Alert.alert(
				"L'inscription a échoué",
				"L'e-mail ou le nom d'utilisateur sont déjà utilisés."
			);
			return;
		}

		if (
			loweredMessage.includes("username") &&
			(loweredMessage.includes("invalid") || loweredMessage.includes("characters"))
		) {
			Alert.alert(
				"L'inscription a échoué",
				"Le pseudo contient des caractères non autorisés."
			);
			return;
		}

		Alert.alert("L'inscription a échoué", normalizedMessage);
	};

	const mutation = useRegisterNewUser(onSuccess, onError);

	const handleLogin = (payload: FormPayload) => {
		if (!payload) {
			Alert.alert("Error", "Please complete all fields before proceeding.");
			return;
		}
		mutation.mutate(payload);
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
		<View style={styles.container}>
			<View
				style={[
					styles.logoContainer,
					{ paddingTop: Math.max(insets.top, 20) + 12 },
				]}>
				<LogoPageTop />
			</View>

			<View style={{ flex: 1, width: "100%" }}>
				{step === 1 && (
					<RegisterStep1
						setStep={setStep}
						formPayload={formPayload as any}
						setFormPayload={setFormPayload as any}
					/>
				)}
				{step === 2 && (
					<RegisterStep2
						formPayload={formPayload as any}
						setFormPayload={setFormPayload as any}
						handleLogin={handleLogin}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		paddingHorizontal: 24,
		alignItems: "center",
		justifyContent: "flex-start",
		backgroundColor: "#F5F5F5",
	},
	scrollContainer: {
		minWidth: "100%",
	},
	logoContainer: {
		width: "100%",
		alignItems: "center",
		marginBottom: 12,
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
});

export default Register;
