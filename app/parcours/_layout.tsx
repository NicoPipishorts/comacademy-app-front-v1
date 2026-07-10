import { Stack } from "expo-router";
import React from "react";

export default function ParcoursLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "none",
				presentation: "card",
			}}
		/>
	);
}
