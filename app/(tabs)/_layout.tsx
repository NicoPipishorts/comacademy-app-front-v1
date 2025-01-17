// app/(tabs)/_layout.tsx
import { useAuth } from "@/auth/AuthContext";
import TabBar from "@/components/TabBar";
import {
	TabBarVisibilityProvider,
	useTabBarVisibility,
} from "@/context/TabBarVisibilityContext";
import {
	PushNotificationContext,
	PushNotificationProvider,
} from "@/providers/PushNotificationProvider";
import Register from "@/screens/Register/Register";
import * as Notifications from "expo-notifications";
import { Tabs } from "expo-router";
import { useContext, useEffect } from "react";
import LoginScreen from "../../screens/Sign-in";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

const CustomTabBar: React.FC<any> = (props) => {
	const { isTabBarVisible } = useTabBarVisibility();

	const { notification } = useContext(PushNotificationContext);

	// Display notification alert if one is received
	useEffect(() => {
		//TODO NOTIFICATION : add notification details
		// if (notification) {
		// 	return null;
		// }
	}, [notification]);

	if (!isTabBarVisible) return null;

	return <TabBar {...props} />;
};

const _layout: React.FC = () => {
	const { isAuthenticated, isRegistering, logout } = useAuth();

	if (!isAuthenticated && !isRegistering) {
		return <LoginScreen />;
	}

	if (!isAuthenticated && isRegistering) {
		return <Register />;
	}

	return (
		<PushNotificationProvider>
			<TabBarVisibilityProvider>
				<Tabs tabBar={(props) => <CustomTabBar {...props} />}>
					<Tabs.Screen
						name='index'
						options={{
							tabBarLabel: "index",
							headerShown: false,
						}}
					/>
					<Tabs.Screen
						name='activity'
						options={{
							tabBarLabel: "Accueil",
							headerShown: false,
							lazy: true,
						}}
					/>
					<Tabs.Screen
						name='leJeu'
						options={{
							tabBarLabel: "Le Jeu",
							headerShown: false,
							lazy: true,
						}}
					/>
					<Tabs.Screen
						name='feed'
						options={{
							tabBarLabel: "Feed",
							headerShown: false,
							unmountOnBlur: true,
						}}
					/>
					<Tabs.Screen
						name='playlists'
						options={{
							tabBarLabel: "Playlists",
							headerShown: false,
							unmountOnBlur: true,
						}}
					/>
					<Tabs.Screen
						name='dico'
						options={{
							tabBarLabel: "Dico",
							headerShown: false,
							unmountOnBlur: true,
						}}
					/>
					<Tabs.Screen
						name='metiers'
						options={{
							tabBarLabel: "Metiers",
							headerShown: false,
							unmountOnBlur: true,
						}}
					/>
					<Tabs.Screen
						name='user'
						options={{
							tabBarLabel: "User",
							headerShown: false,
							href: null,
						}}
					/>
					<Tabs.Screen
						name='lesCitations'
						options={{
							tabBarLabel: "Les Citations",
							headerShown: false,
							unmountOnBlur: true,
						}}
					/>
					<Tabs.Screen
						name='secrets'
						options={{
							tabBarLabel: "3 Secrets",
							headerShown: false,
							href: null,
						}}
					/>
					<Tabs.Screen
						name='commandements'
						options={{
							tabBarLabel: "10 Commandements",
							headerShown: false,
							href: null,
						}}
					/>
					<Tabs.Screen
						name='petitesHistoires'
						options={{
							tabBarLabel: "Les Petites Histoires",
							headerShown: false,
							href: null,
						}}
					/>
				</Tabs>
			</TabBarVisibilityProvider>
		</PushNotificationProvider>
	);
};

export default _layout;
