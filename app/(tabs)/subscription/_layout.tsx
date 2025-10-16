import { Stack } from "expo-router";
import React from "react";

const Subscriptions = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "Abonnements",
				}}
			/>
		</Stack>
	);
};

export default Subscriptions;
