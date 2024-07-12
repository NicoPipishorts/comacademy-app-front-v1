import { useAuth } from "@/auth/AutContext";
import TabBar from "@/components/TabBar";
import { Tabs } from "expo-router";
import React from "react";
import LoginScreen from "../../screens/LoginScreen";

const _layout = () => {
// @ts-expect-error TS(2339): Property 'isAuthenticated' does not exist on type ... Remove this comment to see the full error message
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <LoginScreen />;
	}

	return (
		<Tabs tabBar={(props) => <TabBar {...props} />}>
			<Tabs.Screen
				name='index'
				options={{
// @ts-expect-error TS(2322): Type 'null' is not assignable to type 'string | un... Remove this comment to see the full error message
					title: null,
					tabBarLabel: "Accueil",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='le_jeu'
				options={{
// @ts-expect-error TS(2322): Type 'null' is not assignable to type 'string | un... Remove this comment to see the full error message
					title: null,
					tabBarLabel: "Le Jeu",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='playlists'
				options={{
// @ts-expect-error TS(2322): Type 'null' is not assignable to type 'string | un... Remove this comment to see the full error message
					title: null,
					tabBarLabel: "Playlists",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='dico'
				options={{
// @ts-expect-error TS(2322): Type 'null' is not assignable to type 'string | un... Remove this comment to see the full error message
					title: null,
					tabBarLabel: "Dico",
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name='metiers'
				options={{
// @ts-expect-error TS(2322): Type 'null' is not assignable to type 'string | un... Remove this comment to see the full error message
					title: null,
					tabBarLabel: "Metiers",
					headerShown: false,
				}}
			/>
		</Tabs>
	);
};

export default _layout;
