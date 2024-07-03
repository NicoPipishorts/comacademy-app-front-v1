import TabBar from "@/components/TabBar";
import { Tabs } from "expo-router";
import React from "react";

const _layout = () => {
	return (
		<Tabs tabBar={(props) => <TabBar {...props} />}>
			<Tabs.Screen
				name='index'
				options={{
					title: "Accueil",
				}}
			/>
			<Tabs.Screen
				name='le_jeu'
				options={{
					title: "Le Jeu",
				}}
			/>
			<Tabs.Screen
				name='playlist'
				options={{
					title: "Playlist",
				}}
			/>
			<Tabs.Screen
				name='dico'
				options={{
					title: "Dico",
				}}
			/>
			<Tabs.Screen
				name='metiers'
				options={{
					title: "Metiers",
				}}
			/>
		</Tabs>
	);
};

export default _layout;
