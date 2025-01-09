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
				}}
			/>
		</Stack>
	);
};

export default FeedLayout;
