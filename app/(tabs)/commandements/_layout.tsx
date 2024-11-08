import { CommandementProvider } from "@/context/contextCommandements";
import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
		<CommandementProvider>
			<Stack>
				<Stack.Screen
					name='index'
					options={{
						headerShown: false,
						headerTitle: "Le Dico",
					}}
				/>
				<Stack.Screen
					name='CommandementsDetails'
					options={{
						headerShown: false,
						headerTitle: "Details les 10 Commandements",
						presentation: "modal",
					}}
				/>
			</Stack>
		</CommandementProvider>
	);
};

export default LeJeuLayout;
