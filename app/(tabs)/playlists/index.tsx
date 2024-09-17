import AddPlaylist from "@/assets/imgs/icons/AddPlaylist.png";
import CardFavoritesList from "@/components/cards/CardFavoritesList";
import { primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeaders from "../../../components/ScreenHeaders";

const Playlist = () => {
	const insets = useSafeAreaInsets();
	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<ScreenHeaders content='Playlist' />

			<TouchableOpacity style={styles.addPlaylistContainer}>
				<Image source={AddPlaylist} style={styles.addPlaylistImage} />
				<View style={{ flexDirection: "column" }}>
					<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
						Nouvelle Playlist
					</Text>
					<Text style={{ fontSize: FontSize12 }}>Ajouter une Playlist</Text>
				</View>
			</TouchableOpacity>

			<CardFavoritesList
				type='favorites'
				title='Favorites'
				destination='favorites'
			/>
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
