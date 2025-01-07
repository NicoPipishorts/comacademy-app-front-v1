import { useCreateNewPlaylist } from "@/api/createNewPlaylist";
import AddPlaylist from "@/assets/imgs/icons/AddPlaylist.png";
import ScreenHeaders from "@/components/ScreenHeaders";
import CardFavoritesList from "@/components/cards/CardFavoritesList";
import NewPlaylistModal from "@/components/modal/NewPlaylistModal";
import { primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Playlist = () => {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const [modalVisible, setModalVisible] = useState(false);

	const onSuccess = (data: any) => {
		console.log("successfully created the new playlist : ", data);
	};

	const onError = (error: AxiosError) => {
		console.error(`Failed to create new playlist":`, error.message);
	};

	const { mutate: createNewPlaylist } = useCreateNewPlaylist(
		onSuccess,
		onError
	);

	useTrackPageMetrics({ page: "Playlists", token });

	const handleCreatePlaylist = (name: string) => {
		createNewPlaylist({ name, userId, authToken: token });
		setModalVisible(false);
	};

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<ScreenHeaders content='Playlists' />

			<TouchableOpacity
				style={styles.addPlaylistContainer}
				onPress={() => setModalVisible(true)}>
				<Image source={AddPlaylist} style={styles.addPlaylistImage} />
				<View style={{ flexDirection: "column" }}>
					<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
						Nouvelle Playlist
					</Text>
					<Text style={{ fontSize: FontSize12 }}>Ajouter une Playlist</Text>
				</View>
			</TouchableOpacity>

			<CardFavoritesList type='favorites' title='Questions ' />
			<CardFavoritesList type='metiers' title='Les Metiers ' />
			<CardFavoritesList type='dicos' title='Dico ' />

			<NewPlaylistModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onSubmit={handleCreatePlaylist}
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
