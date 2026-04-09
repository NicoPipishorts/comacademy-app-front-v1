import { Stack } from "expo-router";
import React from "react";

const DashboardLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "Moi",
				}}
			/>
		</Stack>
	);
};

export default DashboardLayout;
