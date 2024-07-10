import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useLoginMutation } from "../api/login"; // Adjust the path as necessary
import { useAuth } from "../auth/AutContext";

const LoginScreen = () => {
	const authUrl = process.env.EXPO_PUBLIC_AUTH_URL;
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useAuth();

	const onSuccess = (data) => {
		console.log("Login successful:", data);
		login(data); // Update your auth context or navigate
	};

	const onError = (error) => {
		alert("Login failed: " + error.message);
	};

	const mutation = useLoginMutation(authUrl, onSuccess, onError);

	const handleLogin = () => {
		mutation.mutate({ identifier: username, password: password });
	};

	useEffect(() => {
		// No need to track mutation state here, it's handled in the hook
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<TextInput
				style={styles.input}
				onChangeText={setUsername}
				value={username}
				placeholder='Username'
				autoCapitalize='none'
			/>
			<TextInput
				style={styles.input}
				onChangeText={setPassword}
				value={password}
				placeholder='Password'
				secureTextEntry={true}
				autoCapitalize='none'
			/>
			<Button title='Log In' onPress={handleLogin} />
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
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	input: {
		width: "100%",
		height: 40,
		marginBottom: 12,
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
		borderColor: "#ccc",
	},
});

export default LoginScreen;
