import { GameProvider } from "@/providers/gameDataContext";
import { Stack } from "expo-router";
import React from "react";

const UserLayout = () => {
	return (
		<GameProvider>
			<Stack>
				<Stack.Screen
					name='index'
					options={{
						headerShown: false,
						headerTitle: "User",
					}}
				/>
				<Stack.Screen
					name='leaderBoard'
					options={{
						headerShown: false,
						headerTitle: "Les Leaders",
						animation: "fade",
					}}
				/>
				<Stack.Screen
					name='myStats'
					options={{
						headerShown: false,
						headerTitle: "Mes Stats",
						animation: "fade",
					}}
				/>
				<Stack.Screen
					name='iapBarebone'
					options={{
						headerShown: false,
						headerTitle: "In-App Purchases",
						presentation: "modal",
					}}
				/>
				<Stack.Screen
					name='iapRawDebug'
					options={{
						headerShown: false,
						headerTitle: "In-App Purchases Debug",
						presentation: "modal",
					}}
				/>
			</Stack>
		</GameProvider>
	);
};

export default UserLayout;
