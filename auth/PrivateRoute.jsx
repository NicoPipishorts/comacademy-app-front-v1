import { Stack } from "expo-router";
import React from "react";
import LoginScreen from "../screens/LoginScreen";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ name, component: Component, options }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return (
			<Stack>
				<Stack.Screen
					name='Login'
					component={LoginScreen}
					options={{ headerShown: true }} // Customize as needed
				/>
			</Stack>
		);
	} else {
		// Render the requested component
		return (
			<Stack>
				<Stack.Screen name={name} component={Component} options={options} />
			</Stack>
		);
	}
};

export default PrivateRoute;
