import { Stack } from "expo-router";
import React from "react";

const LoginLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "Le Dico",
				}}
			/>
		</Stack>
	);
};

export default LoginLayout;
