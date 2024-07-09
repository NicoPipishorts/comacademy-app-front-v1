import TabBar from "@/components/TabBar";
import { QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import React from "react";
import { queryClient } from "../hooks/reactQueryConfig";

const _layout = () => {
	return (
		<QueryClientProvider client={queryClient}>
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
		</QueryClientProvider>
	);
};

export default _layout;
