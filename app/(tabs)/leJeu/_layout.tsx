import { GameProvider } from "@/providers/gameDataContext";
import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
		<GameProvider>
			<Stack>
				<Stack.Screen
					name='index'
					options={{
						headerShown: false,
						headerTitle: "Le Jeu",
					}}
				/>
				<Stack.Screen
					name='jeu'
					options={{
						headerShown: false,
						presentation: "card", // Use 'modal' for native modal behavior
					}}
				/>
				<Stack.Screen
					name='finishedSession'
					options={{
						headerShown: false,
						presentation: "card",
					}}
				/>
				<Stack.Screen
					name='answersPostGame'
					options={{
						headerShown: false,
						presentation: "card",
					}}
				/>
				<Stack.Screen
					name='answersDetails'
					options={{
						headerShown: false,
						presentation: "modal",
					}}
				/>
			</Stack>
		</GameProvider>
	);
};

export default LeJeuLayout;
