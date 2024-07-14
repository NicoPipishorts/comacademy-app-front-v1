import { useAuth } from "@/auth/AutContext";
import TabBar from "@/components/TabBar";
import { Tabs } from "expo-router";
import React from "react";
import LoginScreen from "../../screens/LoginScreen";

const _layout = () => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <LoginScreen />;
	}

	return (
		<Tabs tabBar={(props) => <TabBar {...props} />}>
			<Tabs.Screen
				name='index'
				options={{
					tabBarLabel: "Accueil",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='leJeu'
				options={{
					tabBarLabel: "Le Jeu",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='playlists'
				options={{
					tabBarLabel: "Playlists",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='dico'
				options={{
					tabBarLabel: "Dico",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='metiers'
				options={{
					tabBarLabel: "Metiers",
					headerShown: false,
				}}
			/>
		</Tabs>
	);
};

export default _layout;
