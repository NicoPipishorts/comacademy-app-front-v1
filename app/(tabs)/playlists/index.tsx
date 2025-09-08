import { useCreateNewPlaylist } from "@/api/playlist/createNewPlaylist";
import { useDeletePlaylist } from "@/api/playlist/deletePlaylist";
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
import React, { useRef, useState } from "react";
import {
	Image,
	Keyboard,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Playlist = () => {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [modalType, setModalType] = useState<"new" | "edit">(null);
	const [playlistId, setPlaylistId] = useState(null);

	const { data: playlistsData, isFetched } = useGetPlaylistsByUser(userId);
	useTrackPageMetrics({ page: "Playlists" });

	// PlaylistCard Swipe Refs
	const [openedSwipeable, setOpenedSwipeable] = useState(null);
	const swipeableRefs = useRef({});

	const showSnackbar = useSnackbar(); // Use the snackbar context

	const onSuccess = (data: any, message: string) => {
		queryClient.refetchQueries({
			queryKey: ["Playlists"],
		});
		showSnackbar(message, "success");
		if (openedSwipeable) {
			openedSwipeable.close();
			setOpenedSwipeable(null);
		}
	};

	const onError = (error: AxiosError) => {
		console.error(`Failed to create new playlist":`, error.message);
	};

	const { mutate: createNewPlaylist } = useCreateNewPlaylist(
		onSuccess,
		onError
	);
	const handleCreatePlaylist = (name: string, selectedColor: string) => {
		createNewPlaylist({
			name,
			selectedColor,
			userId,
			authToken: token,
			modalType,
			playlistId,
		});
		setModalVisible(false);
		setPlaylistId(null);
	};

	const { mutate: deletePlaylist } = useDeletePlaylist(onSuccess, onError);
	const handDeletePlaylist = (id: number) => {
		deletePlaylist({ elementId: id, authToken: token });
	};

	const handleEditPlaylist = (id: number) => {
		setPlaylistId(id);
		setModalType("edit");
		setModalVisible(true);
	};

	if (!playlistsData && !isFetched) {
		return <Loader />;
	}

	const closeSwipeable = () => {
		if (openedSwipeable) {
			openedSwipeable.close();
			setOpenedSwipeable(null);
		}
	};

	const handleOutsidePress = () => {
		Keyboard.dismiss();
		closeSwipeable();
	};

	return (
		<TouchableWithoutFeedback onPress={handleOutsidePress} accessible={false}>
			<View style={[styles.wrapper, { paddingTop: insets.top }]}>
				<ScreenHeaders content='Playlists' />

				<TouchableOpacity
					style={styles.addPlaylistContainer}
					onPress={() => {
						setModalVisible(true);
						setPlaylistId(null);
						setModalType("new");
						if (openedSwipeable) {
							openedSwipeable.close();
							setOpenedSwipeable(null);
						}
					}}>
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
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps='handled'>
					<CardFavoritesList type='favorites' title='Questions ' />
					<CardFavoritesList type='metiers' title='Metiers ' />
					<CardFavoritesList type='dicos' title='Dico ' />
					<CardFavoritesList type='citations' title='Citations ' />
					{isFetched &&
						playlistsData &&
						playlistsData.data.map((playlist) => {
							const refKey = `swipeable-${playlist.id}`;
							if (!swipeableRefs.current[refKey]) {
								swipeableRefs.current[refKey] = React.createRef();
							}
							return (
								<CardPlaylist
									key={playlist.id}
									id={playlist.id}
									refKey={refKey}
									swipeableRefs={swipeableRefs}
									openedSwipeable={openedSwipeable}
									title={playlist.attributes.name}
									color={playlist.attributes.selectedColor}
									setOpenedSwipeable={setOpenedSwipeable}
									handDeletePlaylist={handDeletePlaylist}
									handleEditPlaylist={handleEditPlaylist}
								/>
							);
						})}
				</ScrollView>

				<NewPlaylistModal
					visible={modalVisible}
					onClose={() => setModalVisible(false)}
					onSubmit={handleCreatePlaylist}
					playlistId={playlistId}
				/>
			</View>
		</TouchableWithoutFeedback>
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
