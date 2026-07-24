import { useCreateNewPlaylist } from "@/api/playlist/createNewPlaylist";
import { useDeletePlaylist } from "@/api/playlist/deletePlaylist";
import AddPlaylist from "@/assets/imgs/icons/AddPlaylist.png";
import CardFavoritesList from "@/components/cards/CardFavoritesList";
import CardPlaylist from "@/components/cards/CardPlaylists";
import PlaylistsSkeleton from "@/components/experience/PlaylistsSkeleton";
import NewPlaylistModal from "@/components/modal/NewPlaylistModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetPlaylistsByUser from "@/hooks/Playlistss/useGetPlaylistsByUser";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";
import useSwipeableRows from "@/hooks/useSwipeableRows";
import { AxiosError } from "axios";
import React, { useState } from "react";
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
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [modalType, setModalType] = useState<"new" | "edit" | null>(null);
	const [playlistId, setPlaylistId] = useState<number | null>(null);

	const { data: playlistsData, isFetched } = useGetPlaylistsByUser(
		auth?.user.id,
	);
	useTrackPageMetrics({ page: "Playlists" });

	// PlaylistCard Swipe Refs
	const {
		openedSwipeable,
		setOpenedSwipeable,
		swipeableRefs,
		closeOpenedSwipeable,
	} = useSwipeableRows();

	const showSnackbar = useSnackbar(); // Use the snackbar context

	const onSuccess = (data: any, message: string) => {
		queryClient.refetchQueries({
			queryKey: ["Playlists"],
		});
		showSnackbar(message, "success");
		closeOpenedSwipeable();
	};

	const onError = (error: AxiosError) => {
		console.error(`Failed to create new playlist":`, error.message);
	};

	const { mutate: createNewPlaylist } = useCreateNewPlaylist(
		onSuccess,
		onError,
	);
	const handleCreatePlaylist = (name: string, selectedColor: string) => {
		createNewPlaylist({
			name,
			selectedColor,
			userId: auth?.user.id,
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
		return <PlaylistsSkeleton />;
	}

	const handleOutsidePress = () => {
		Keyboard.dismiss();
		closeOpenedSwipeable();
	};

	return (
		<TouchableWithoutFeedback onPress={handleOutsidePress} accessible={false}>
			<View style={styles.wrapper}>
				<ScrollView
					contentContainerStyle={[
						styles.scrollContent,
						{ paddingTop: insets.top, paddingBottom: insets.bottom + 90 },
					]}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps='handled'>
					<PageTitleAvatarHeader title='Playlists' />

					<TouchableOpacity
						style={styles.addPlaylistContainer}
						onPress={() => {
							setModalVisible(true);
							setPlaylistId(null);
							setModalType("new");
							closeOpenedSwipeable();
						}}>
						<Image source={AddPlaylist} style={styles.addPlaylistImage} />
						<View style={{ flexDirection: "column" }}>
							<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
								Nouvelle Playlist
							</Text>
							<Text style={{ fontSize: FontSize12 }}>Ajouter une Playlist</Text>
						</View>
					</TouchableOpacity>

					<View style={styles.playlistsContainer}>
						<CardFavoritesList type='favorites' title='Questions ' />
						<CardFavoritesList type='metiers' title='Metiers ' />
						<CardFavoritesList type='dicos' title='Dico ' />
						<CardFavoritesList type='citations' title='Citations ' />
						{isFetched &&
							playlistsData?.data &&
							playlistsData.data?.map((playlist) => {
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
					</View>
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
		paddingHorizontal: 24,
		backgroundColor: primaryBackground,
	},
	scrollContent: {
		flexGrow: 1,
	},
	playlistsContainer: {
		paddingTop: 30,
	},
	addPlaylistContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	addPlaylistImage: {
		width: 70,
		height: 70,
		marginRight: 15,
	},
});

export default Playlist;
