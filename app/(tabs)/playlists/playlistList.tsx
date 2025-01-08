import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import useGetPlaylistById from "@/hooks/Playlistss/getPlaylistById";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const PlaylistList = () => {
	// Retrieve the passed parameter
	const { playlistId } = useLocalSearchParams();
	const playlistIdNumber = playlistId ? Number(playlistId) : null;

	const { data: playlistData, isLoading } =
		useGetPlaylistById(playlistIdNumber);

	if (!playlistData && isLoading) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<Loader />
			</View>
		);
	}

	console.log(playlistData.data.attributes.playlist_contents);

	return (
		<View style={styles.container}>
			<ScreenHeaders content={playlistData.data.attributes.name} />

			<ScrollView>
				{!playlistData.data.attributes.playlist_contents && (
					<View>No contents available</View>
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		flex: 1,
		alignItems: "flex-start",
		justifyContent: "flex-start",
	},
	text: {
		fontSize: 18,
		fontWeight: "bold",
	},
});

export default PlaylistList;
