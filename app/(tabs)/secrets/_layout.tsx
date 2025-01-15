import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "Les 3 Secrets",
				}}
			/>
			<Stack.Screen
				name='SecretsDetails'
				options={{
					headerShown: false,
					headerTitle: "Details les 3 Secrets",
					presentation: "modal",
				}}
			/>
		</Stack>
	);
};

export default LeJeuLayout;
