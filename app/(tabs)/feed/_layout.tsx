import { Stack } from "expo-router";
import React from "react";

const FeedLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "Feed",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name='Detail3Secrets'
				options={{
					headerShown: false,
					headerTitle: "Feed Secrets Card",
					presentation: "modal",
				}}
			/>
		</Stack>
	);
};

export default FeedLayout;
