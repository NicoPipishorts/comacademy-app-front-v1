// app/(tabs)/_layout.tsx
import { useAuth } from "@/auth/AutContext";
import TabBar from "@/components/TabBar";
import {
	TabBarVisibilityProvider,
	useTabBarVisibility,
} from "@/context/TabBarVisibilityContext";
import { Tabs } from "expo-router";
import React from "react";
import LoginScreen from "../../screens/LoginScreen";

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
		</TabBarVisibilityProvider>
	);
};

export default _layout;
