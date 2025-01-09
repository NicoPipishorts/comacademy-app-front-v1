import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "Le Jeu",
				}}
			/>
			<Stack.Screen
				name='metierDetails'
				options={{
					headerShown: false,
					headerTitle: "Les Détails",
					presentation: "containedModal",
				}}
			/>
		</Stack>
	);
};

export default LeJeuLayout;
