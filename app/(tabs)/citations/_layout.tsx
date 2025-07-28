import { Stack } from "expo-router";
import React from "react";

const CitationsLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "Citations",
				}}
			/>
			<Stack.Screen
				name='CitationsDetails'
				options={{
					headerShown: false,
					headerTitle: "Les Citations",
					presentation: "modal",
				}}
			/>
		</Stack>
	);
};

export default CitationsLayout;
