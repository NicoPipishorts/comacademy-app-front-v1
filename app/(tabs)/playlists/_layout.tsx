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
					name='playlistContent'
					options={{
						headerShown: false,
						headerTitle: "List",
						presentation: "modal",
					}}
				/>
			</Stack>
		</GameProvider>
	);
};

export default LeJeuLayout;
