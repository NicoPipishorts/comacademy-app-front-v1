import { Stack } from "expo-router";
import React from "react";

const ActivityLayout = () => {
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

export default ActivityLayout;
