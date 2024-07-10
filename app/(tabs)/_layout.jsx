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
					title: null,
					tabBarLabel: "Accueil",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='le_jeu'
				options={{
					title: null,
					tabBarLabel: "Le Jeu",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='playlists'
				options={{
					title: null,
					tabBarLabel: "Playlists",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='dico'
				options={{
					title: null,
					tabBarLabel: "Dico",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='metiers'
				options={{
					title: null,
					tabBarLabel: "Metiers",
					headerShown: false,
				}}
			/>
		</Tabs>
	);
};

export default _layout;
