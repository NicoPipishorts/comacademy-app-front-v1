import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

// Import Assets
import { useRegisterNewUser } from "@/api/credentials/registerNewUser";
import { UseAuth } from "@/auth/AuthContext";
import LogoPageTop from "@/components/headers/LogoPageTop";
import { AuthResponse } from "@/types/credentials/auth";
import { NavigationType } from "@/types/general";
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
		navigation.navigate("(tabs)");
	};

	const onError = (error) => {
		const key = error.message.split(" ")[0];
		const translation = () => {
			switch (key) {
				case "Email":
					return "L'e-mail ou le nom d'utilisateur sont déjà pris";
				default:
					return error.message;
			}
		};
		Alert.alert("L'inscription a échoué", translation());
	};

	const mutation = useRegisterNewUser(onSuccess, onError);

	const handleLogin = (payload: FormPayload) => {
		if (!payload) {
			Alert.alert("Error", "Please complete all fields before proceeding.");
			return;
		}
		const formPayloadToSubmit = { ...payload, profile: 2 };
		mutation.mutate(formPayloadToSubmit);
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
			<View style={[styles.logoContainer, { paddingTop: insets.top }]}>
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
						setStep={setStep}
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
		padding: 10,
		paddingVertical: 30,
		alignItems: "center",
		justifyContent: "center",
	},
	scrollContainer: {
		minWidth: "100%",
	},
	logoContainer: {
		marginBottom: 20,
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
