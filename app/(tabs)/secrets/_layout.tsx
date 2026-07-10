import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "La Capsule",
				}}
			/>
			<Stack.Screen
				name='SecretsDetails'
				options={{
					headerShown: false,
					headerTitle: "Détails La Capsule",
					presentation: "modal",
				}}
			/>
		</Stack>
	);
};

export default LeJeuLayout;
