import { SecretsProvider } from "@/context/contextSecrets";
import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
		<SecretsProvider>
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
		</SecretsProvider>
	);
};

export default LeJeuLayout;
