// app/(tabs)/_layout.tsx
import { useAuth } from "@/auth/AuthContext";
import BannerContainer from "@/components/banners/bannerContainer";
import TabBar from "@/components/TabBar";
import {
	TabBarVisibilityProvider,
	useTabBarVisibility,
} from "@/context/TabBarVisibilityContext";
import Register from "@/screens/Register/Register";
import * as Notifications from "expo-notifications";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import LoginScreen from "../../screens/Sign-in";
import NotificationScheduler from "../../services/notifications/LocalNotifications";

const CustomTabBar: React.FC<any> = (props) => {
	const { isTabBarVisible } = useTabBarVisibility();
	useEffect(() => {
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowBanner: true,
				shouldShowList: true,
				shouldPlaySound: true,
				shouldSetBadge: false,
			}),
		});
	}, []);

	// Display notification alert if one is received

	if (!isTabBarVisible) return null;

	return <TabBar {...props} />;
};

const _layout: React.FC = () => {
	const { isAuthenticated, isRegistering, logout } = useAuth();

	// useEffect(() => {
	// 	logout();
	// }, []);

	if (!isAuthenticated && !isRegistering) {
		return <LoginScreen />;
	}

	if (!isAuthenticated && isRegistering) {
		return <Register />;
	}

	return (
		<TabBarVisibilityProvider>
			{/* Add the notification scheduler */}
			<NotificationScheduler />
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
					name='feedback'
					options={{
						tabBarLabel: "Feedback",
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
					}}
				/>
				<Tabs.Screen
					name='citations'
					options={{
						tabBarLabel: "Citations",
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
				<Tabs.Screen
					name='trenteSecondes'
					options={{
						tabBarLabel: "3 Secondes",
						headerShown: false,
						href: null,
					}}
				/>
				<Tabs.Screen
					name='topDesFlops'
					options={{
						tabBarLabel: "Top des Flops",
						headerShown: false,
						href: null,
					}}
				/>
			</Tabs>

			{/* The BannerContainer manages the lifecycle of the BannerFree */}
			<BannerContainer />
		</TabBarVisibilityProvider>
	);
};

export default _layout;
