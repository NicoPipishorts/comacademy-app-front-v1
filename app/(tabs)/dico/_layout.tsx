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
				name='dicoDetails'
				options={{
					headerShown: false,
					headerTitle: "Le Dico Details",
					presentation: "modal",
				}}
			/>
		</Stack>
	);
};

export default LeJeuLayout;
