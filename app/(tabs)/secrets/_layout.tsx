import { SecretsProvider } from "@/context/contextSecrets";
import { GameProvider } from "@/providers/gameDataContext";
import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
		<GameProvider>
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
		</GameProvider>
	);
};

export default LeJeuLayout;
