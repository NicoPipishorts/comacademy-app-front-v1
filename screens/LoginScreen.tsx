import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Ensure you have the correct navigation import
import React, { useEffect, useState } from "react";
import {
	Alert,
	Image,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useLoginMutation } from "../api/login";
import { useAuth } from "../auth/AuthContext";

// Import Assets
import {
	colorBlack,
	colorBlue,
	colorDarkGrey,
	colorGreen,
	colorLightGrey,
	colorOrange,
	colorPurple,
	colorTurquoise,
	colorWhite,
	colorYellow,
} from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import { LoginPayload } from "@/types/login";
import Logo from "../assets/imgs/logos/Login.png";

const LoginScreen = () => {
	const navigation = useNavigation();
	const authUrl = process.env.EXPO_PUBLIC_AUTH_URL;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const { login, checkLoggedIn } = useAuth();

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const onSuccess = (data: LoginPayload) => {
		login(data);
		navigation.navigate("(tabs)"); // Navigate to the home screen upon successful login
	};

	const onError = (error) => {
		Alert.alert("L'adresse email ou mot de passe sont incorrect."); // Using Alert from react-native
	};

	const mutation = useLoginMutation(authUrl, onSuccess, onError);

	const handleLogin = () => {
		mutation.mutate({ identifier: email, password: password });
	};

	useEffect(() => {
		const checkIfLoggedIn = async () => {
			const loggedIn = await checkLoggedIn();
			if (loggedIn) {
				navigation.navigate("(tabs)"); // Navigate to the home screen if already logged in
			}
		};

		checkIfLoggedIn();
	}, [navigation, checkLoggedIn]);

	return (
		<View style={styles.container}>
			<View style={styles.logoContainer}>
				<Image source={Logo} style={styles.logo} resizeMode='contain' />
				<View style={styles.containerDots}>
					<View style={[styles.dot, { backgroundColor: colorPurple }]}></View>
					<View style={[styles.dot, { backgroundColor: colorOrange }]}></View>
					<View style={[styles.dot, { backgroundColor: colorYellow }]}></View>
					<View style={[styles.dot, { backgroundColor: colorGreen }]}></View>
					<View
						style={[styles.dot, { backgroundColor: colorTurquoise }]}></View>
					<View style={[styles.dot, { backgroundColor: colorBlue }]}></View>
				</View>
			</View>
			<Text style={styles.title}>C'est bon de se revoir !</Text>

			<View style={styles.passwordInputContainer}>
				<TextInput
					style={styles.input}
					onChangeText={setEmail}
					value={email}
					placeholder='Email'
					placeholderTextColor={colorBlack}
					autoCapitalize='none'
				/>
			</View>

			<View style={styles.passwordInputContainer}>
				<TextInput
					secureTextEntry={!showPassword}
					value={password}
					onChangeText={setPassword}
					style={styles.input}
					placeholder='Mot de Passe'
					placeholderTextColor={colorBlack}
				/>
				<MaterialCommunityIcons
					name={showPassword ? "eye-off" : "eye"}
					size={24}
					color={colorBlack}
					style={styles.eyeIcon}
					onPress={toggleShowPassword}
				/>
			</View>
			<View style={styles.containerForgot}>
				<TouchableOpacity>
					<Text style={styles.textForgot}>Mot de passe oublié?</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.buttonContainer}>
				<TouchableOpacity onPress={handleLogin}>
					<Text style={styles.buttonText}>Se connecter</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#fff",
	},
	logoContainer: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "center",
		position: "absolute",
		top: 50,
		left: 0,
		right: 0,
	},
	logo: {
		maxWidth: "45%",
	},
	containerDots: {
		flexDirection: "row",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		top: 95,
		left: 0,
		right: 0,
	},
	dot: {
		width: 10,
		height: 10,
		marginHorizontal: 8,
		borderRadius: 50,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 80,
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
		borderBottomColor: colorLightGrey,
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
		width: "100%",
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

export default LoginScreen;
function alert(arg0: string) {
	throw new Error("Function not implemented.");
}
