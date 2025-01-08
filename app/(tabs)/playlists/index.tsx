import { useCreateNewPlaylist } from "@/api/createNewPlaylist";
import AddPlaylist from "@/assets/imgs/icons/AddPlaylist.png";
import ScreenHeaders from "@/components/ScreenHeaders";
import CardFavoritesList from "@/components/cards/CardFavoritesList";
import CardPlaylist from "@/components/cards/CardPlaylists";
import Loader from "@/components/experience/loader";
import NewPlaylistModal from "@/components/modal/NewPlaylistModal";
import { primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetPlaylistsByUser from "@/hooks/Playlistss/useGetPlaylistsByUser";
import { queryClient } from "@/hooks/reactQueryConfig";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { AxiosError } from "axios";
import React, { useState } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Playlist = () => {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const [modalVisible, setModalVisible] = useState(false);

	const showSnackbar = useSnackbar(); // Use the snackbar context
	useTrackPageMetrics({ page: "Playlists", token });

	// ----- Create playist code below
	const onSuccess = (data: any) => {
		queryClient.refetchQueries({
			queryKey: ["Playlists"],
		});
		showSnackbar("La playlist a était créée", "success");
	};

	const onError = (error: AxiosError) => {
		console.error(`Failed to create new playlist":`, error.message);
	};

	const { mutate: createNewPlaylist } = useCreateNewPlaylist(
		onSuccess,
		onError
	);

	const handleCreatePlaylist = (name: string, selectedColor: string) => {
		createNewPlaylist({ name, selectedColor, userId, authToken: token });
		setModalVisible(false);
	};
	// ----- End create playlist

	const { data: playlistsData, isLoading } = useGetPlaylistsByUser(userId);

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

			<ScrollView
				contentContainerStyle={styles.playlistsContainer}
				showsVerticalScrollIndicator={false}>
				<CardFavoritesList type='favorites' title='Questions ' />
				<CardFavoritesList type='metiers' title='Les Metiers ' />
				<CardFavoritesList type='dicos' title='Dico ' />

				{isLoading && <Loader />}
				{!isLoading &&
					playlistsData &&
					playlistsData.data.map((playlist) => {
						return (
							<CardPlaylist
								key={playlist.id}
								id={playlist.id}
								title={playlist.attributes.name}
								color={playlist.attributes.selectedColor}
							/>
						);
					})}
			</ScrollView>

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
		paddingHorizontal: 30,
		paddingBottom: 90,
		backgroundColor: primaryBackground,
	},
	playlistsContainer: {
		paddingTop: 30,
		paddingBottom: 10,
	},
	addPlaylistContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 30,
	},
	addPlaylistImage: {
		width: 70,
		height: 70,
		marginRight: 15,
	},
});

export default Playlist;
