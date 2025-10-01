import { useAuth } from "@/auth/AuthContext";
import { Stack } from "expo-router";
import React from "react";
import SignIn from "../screens/Sign-in";

const PrivateRoute = ({ name, component: Component, options }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return (
			<Stack>
				<Stack.Screen
					name='Login'
					component={SignIn}
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
