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
					name='questionsFavoritesList'
					options={{
						headerShown: false,
						headerTitle: "List",
						presentation: "modal",
					}}
				/>
				<Stack.Screen
					name='favoriteQuestionDetails'
					options={{
						headerShown: false,
						headerTitle: "Favorite Details",
						presentation: "modal",
					}}
				/>
			</Stack>
		</GameProvider>
	);
};

export default LeJeuLayout;
