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
				name='jeu'
				options={{
					headerShown: false,
					presentation: "fullScreenModal",
					gestureEnabled: true,
				}}
			/>
		</Stack>
	);
};

export default LeJeuLayout;
