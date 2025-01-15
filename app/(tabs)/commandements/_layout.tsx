import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
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
	);
};

export default LeJeuLayout;
