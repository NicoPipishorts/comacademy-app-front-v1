import { Stack } from "expo-router";
import React from "react";

const LeJeuLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					headerShown: false,
					headerTitle: "Playlists",
				}}
			/>
			<Stack.Screen
				name='questionsFavoritesList'
				options={{
					headerShown: false,
					headerTitle: "Favorite Questions List",
					presentation: "modal",
				}}
			/>
			<Stack.Screen
				name='metiersFavoritesList'
				options={{
					headerShown: false,
					headerTitle: "Favorite Metiers List",
					presentation: "modal",
				}}
			/>
			<Stack.Screen
				name='dicosFavoritesList'
				options={{
					headerShown: false,
					headerTitle: "Favorite Dico List",
					presentation: "modal",
				}}
			/>
			<Stack.Screen
				name='playlistList'
				options={{
					headerShown: false,
					headerTitle: "List of items of a specific playlist",
					presentation: "modal",
				}}
			/>
			<Stack.Screen
				name='favoriteQuestionDetails'
				options={{
					headerShown: false,
					headerTitle: "Favorite Details",
					presentation: "modal",
				}}
			/>
			<Stack.Screen
				name='favoriteMetierDetails'
				options={{
					headerShown: false,
					headerTitle: "Favorite Metier Details",
					presentation: "modal",
				}}
			/>
			<Stack.Screen
				name='favoriteDicoDetails'
				options={{
					headerShown: false,
					headerTitle: "Favorite Dico Details",
					presentation: "modal",
				}}
			/>
		</Stack>
	);
};

export default LeJeuLayout;
