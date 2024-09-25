// app/(tabs)/_layout.tsx
import { useAuth } from "@/auth/AuthContext";
import TabBar from "@/components/TabBar";
import {
	TabBarVisibilityProvider,
	useTabBarVisibility,
} from "@/context/TabBarVisibilityContext";
import LoginScreen from "@/screens/LoginScreen";
import { Tabs } from "expo-router";
import React from "react";

const CustomTabBar: React.FC<any> = (props) => {
	const { isTabBarVisible } = useTabBarVisibility();

	if (!isTabBarVisible) return null;

	return <TabBar {...props} />;
};

const _layout: React.FC = () => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <LoginScreen />;
	}

	return (
		<TabBarVisibilityProvider>
			<Tabs tabBar={(props) => <CustomTabBar {...props} />}>
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
					name='lesCitations'
					options={{
						tabBarLabel: "Les Citations",
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
				<Tabs.Screen
					name='user'
					options={{
						tabBarLabel: "User",
						headerShown: false,
					}}
				/>
				<Tabs.Screen
					name='secrets'
					options={{
						tabBarLabel: "3 Secrets",
						headerShown: false,
					}}
				/>
				<Tabs.Screen
					name='commandements'
					options={{
						tabBarLabel: "10 Commandements",
						headerShown: false,
					}}
				/>
			</Tabs>
		</TabBarVisibilityProvider>
	);
};

export default _layout;
