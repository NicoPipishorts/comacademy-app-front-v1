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
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name='metiersFavoritesList'
				options={{
					headerShown: false,
					headerTitle: "Favorite Metiers List",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name='dicosFavoritesList'
				options={{
					headerShown: false,
					headerTitle: "Favorite Dico List",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name='playlistList'
				options={{
					headerShown: false,
					headerTitle: "List of items of a specific playlist",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name='favoriteQuestionDetails'
				options={{
					headerShown: false,
					headerTitle: "Favorite Details",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name='favoriteMetierDetails'
				options={{
					headerShown: false,
					headerTitle: "Favorite Metier Details",
					presentation: "card",
				}}
			/>
			<Stack.Screen
				name='favoriteDicoDetails'
				options={{
					headerShown: false,
					headerTitle: "Favorite Dico Details",
					presentation: "card",
				}}
			/>
		</Stack>
	);
};

export default LeJeuLayout;
