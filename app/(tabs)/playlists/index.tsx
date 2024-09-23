import ScreenHeaders from "@/components/ScreenHeaders";
import CardFavoritesList from "@/components/cards/CardFavoritesList";
import { primaryBackground } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Playlist = () => {
	const insets = useSafeAreaInsets();
	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<ScreenHeaders content='Playlists' />

			{/* <TouchableOpacity style={styles.addPlaylistContainer}>
				<Image source={AddPlaylist} style={styles.addPlaylistImage} />
				<View style={{ flexDirection: "column" }}>
					<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
						Nouvelle Playlist
					</Text>
					<Text style={{ fontSize: FontSize12 }}>Ajouter une Playlist</Text>
				</View>
			</TouchableOpacity> */}

			<CardFavoritesList type='favorites' title='Questions ' />
			<CardFavoritesList type='metiers' title='Les Metiers ' />
			<CardFavoritesList type='dicos' title='Dico ' />
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		backgroundColor: primaryBackground,
	},
	addPlaylistContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
	},
	addPlaylistImage: {
		width: 70,
		height: 70,
		marginRight: 15,
	},
});

export default Playlist;
