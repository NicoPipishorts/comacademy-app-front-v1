import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Image,
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
import { useLoginMutation } from "../api/login";
import { useAuth } from "../auth/AuthContext";

// Import Assets
import {
	colorBlack,
	colorBlue,
	colorDarkGrey,
	colorGreen,
	colorGrey,
	colorOrange,
	colorPurple,
	colorTurquoise,
	colorWhite,
	colorYellow,
} from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Logo from "../assets/imgs/logos/Login.png";

const LoginScreen = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const authUrl = process.env.EXPO_PUBLIC_AUTH_URL;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const { login, checkLoggedIn } = useAuth();

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const onSuccess = (data) => {
		login(data);
		navigation.navigate("(tabs)"); // Navigate to the home screen upon successful login
	};

	const onError = (error) => {
		Alert.alert("Login failed", error.message); // Using Alert from react-native
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
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={0} // Adjust this offset as needed
			>
				<ScrollView
					contentContainerStyle={styles.scrollContainer}
					keyboardShouldPersistTaps='handled'>
					<View>
						<View style={{ marginTop: insets.top }}>
							<Image source={Logo} style={styles.logo} resizeMode='contain' />
							<View style={styles.containerDots}>
								<View style={[styles.dot, { backgroundColor: colorPurple }]} />
								<View style={[styles.dot, { backgroundColor: colorOrange }]} />
								<View style={[styles.dot, { backgroundColor: colorYellow }]} />
								<View style={[styles.dot, { backgroundColor: colorGreen }]} />
								<View
									style={[styles.dot, { backgroundColor: colorTurquoise }]}
								/>
								<View style={[styles.dot, { backgroundColor: colorBlue }]} />
							</View>
						</View>
					</View>
					<View
						style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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

export default LoginScreen;
