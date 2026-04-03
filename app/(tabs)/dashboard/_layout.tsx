import { Stack } from "expo-router";
import React from "react";

const DashboardLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "My Academy",
				}}
			/>
		</Stack>
	);
};

export default DashboardLayout;
