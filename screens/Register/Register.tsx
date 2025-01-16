import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useAuth } from "../../auth/AuthContext";

// Import Assets
import LogoPageTop from "@/components/headers/LogoPageTop";
import { NavigationType } from "@/types/general";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RegisterStep1 from "./Step1";
import RegisterStep2 from "./Step2";

export interface FormPayload {
	firstName: string;
	lastName: string;
	email: string;
	profile: string;
	password: string;
}

const Register = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const authUrl = process.env.EXPO_PUBLIC_AUTH_URL;
	const { login, checkLoggedIn, setIsRegistering } = useAuth();
	const [formPayload, setFormPayload] = useState<FormPayload>(null);

	const [step, setStep] = useState<number>(1);

	// const onSuccess = (data) => {
	// 	login(data);
	// 	navigation.navigate("(tabs)"); // Navigate to the home screen upon successful login
	// };

	// const onError = (error) => {
	// 	Alert.alert("Login failed", error.message); // Using Alert from react-native
	// };

	// const mutation = useLoginMutation(authUrl, onSuccess, onError);

	// const handleLogin = () => {
	// 	mutation.mutate({ identifier: email, password: password });
	// };

	useEffect(() => {
		const checkIfLoggedIn = async () => {
			const loggedIn = await checkLoggedIn();
			if (loggedIn) {
				navigation.navigate("(tabs)"); // Navigate to the home screen if already logged in
			}
		};

		checkIfLoggedIn();
	}, [navigation, checkLoggedIn]);

	console.log(formPayload);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={0}>
				<ScrollView
					contentContainerStyle={[
						styles.scrollContainer,
						{ paddingTop: insets.top },
					]}
					keyboardShouldPersistTaps='handled'>
					<View style={[styles.logoContainer]}>
						<LogoPageTop />
					</View>

					<View
						style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
						{step === 1 && (
							<RegisterStep1
								setStep={setStep}
								formPayload={formPayload}
								setFormPayload={setFormPayload}
							/>
						)}
						{step === 2 && (
							<RegisterStep2
								setStep={setStep}
								formPayload={formPayload}
								setFormPayload={setFormPayload}
							/>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	scrollContainer: {
		flex: 1,
		minWidth: "100%",
		alignItems: "center",
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
