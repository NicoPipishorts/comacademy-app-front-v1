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
						gestureEnabled: true,
						presentation: "fullScreenModal",
					}}
				/>
				<Stack.Screen
					name='finishedSession'
					options={{
						headerShown: false,
						gestureEnabled: true,
						presentation: "fullScreenModal",
					}}
				/>
				<Stack.Screen
					name='answersPostGame'
					options={{
						headerShown: false,
						gestureEnabled: true,
						presentation: "modal",
					}}
				/>
				<Stack.Screen
					name='answersDetails'
					options={{
						headerShown: false,
						gestureEnabled: true,
						presentation: "modal",
					}}
				/>
				<Stack.Screen
					name='feedbackMessage'
					options={{
						headerShown: false,
						gestureEnabled: true,
						presentation: "modal",
					}}
				/>
			</Stack>
		</GameProvider>
	);
};

export default LeJeuLayout;
