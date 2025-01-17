// app/(tabs)/_layout.tsx
import { useAuth } from "@/auth/AuthContext";
import TabBar from "@/components/TabBar";
import {
	TabBarVisibilityProvider,
	useTabBarVisibility,
} from "@/context/TabBarVisibilityContext";
import Register from "@/screens/Register/Register";
import { Tabs } from "expo-router";
import LoginScreen from "../../screens/Sign-in";

const CustomTabBar: React.FC<any> = (props) => {
	const { isTabBarVisible } = useTabBarVisibility();

	// Display notification alert if one is received

	if (!isTabBarVisible) return null;

	return <TabBar {...props} />;
};

const _layout: React.FC = () => {
	const { isAuthenticated, isRegistering } = useAuth();

	if (!isAuthenticated && !isRegistering) {
		return <LoginScreen />;
	}

	if (!isAuthenticated && isRegistering) {
		return <Register />;
	}

	return (
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
	);
};

export default _layout;
