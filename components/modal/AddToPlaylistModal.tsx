import { useAddToPlaylist } from "@/api/playlist/addToPlaylist";
import { useCreateNewPlaylist } from "@/api/playlist/createNewPlaylist";
import AddPlaylist from "@/assets/imgs/icons/AddPlaylist.png";
import { primaryBackground } from "@/constants/colors";
import { FontSize16, FontSize18 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import useGetPlaylistsForElement from "@/hooks/Playlistss/useGetPlaylistsByElement";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";
import PlaylistDisplayImage from "@/utils/playlist/PlaylistDisplayImage";
import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { AxiosError } from "axios";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Image,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import ModalGestureLine from "../experience/modalGestureLine";
import NewPlaylistModal from "./NewPlaylistModal";

interface Props {
	visible: boolean;
	onClose: () => void;
	elementId: number;
	type: "metier" | "dico" | "question";
}

const SNAP_POINTS = ["50%", "80%"];

export default function AddToPlaylistModal({
	visible,
	onClose,
	type,
	elementId,
}: Props) {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => SNAP_POINTS, []);
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const showSnackbar = useSnackbar();

	const { data: playlistsData, isFetched } = useGetPlaylistsForElement(
		auth?.user.id,
		type,
		elementId
	);

	const onAddSuccess = () => {
		queryClient.refetchQueries({ queryKey: ["Playlists"] });
	};

	const onAddError = (error: AxiosError) => {
		console.error("Failed to add to playlist:", error.message);
		showSnackbar("Impossible d'ajouter à la playlist.", "error");
	};

	const { mutate: addToPlaylist } = useAddToPlaylist(onAddSuccess, onAddError);

	const [newPlaylistVisible, setNewPlaylistVisible] = useState(false);

	const handleSubmitToPlaylist = useCallback(
		(playlistId: number) => {
			addToPlaylist({
				playlistId,
				elementId,
				type,
				authToken: token,
			});
			bottomSheetRef.current?.dismiss();
		},
		[addToPlaylist, elementId, type, token]
	);

	const onCreateSuccess = useCallback(
		(_: unknown, message: string) => {
			queryClient.refetchQueries({ queryKey: ["Playlists"] });
			showSnackbar(message, "success");
		},
		[showSnackbar]
	);

	const onCreateError = useCallback(
		(error: AxiosError) => {
			console.error("Failed to create new playlist:", error.message);
			showSnackbar("Création impossible.", "error");
		},
		[showSnackbar]
	);

	const { mutate: createNewPlaylist } = useCreateNewPlaylist(
		onCreateSuccess,
		onCreateError
	);

	const handleCreatePlaylist = useCallback(
		(name: string, selectedColor: string) => {
			createNewPlaylist({
				name,
				selectedColor,
				userId: auth?.user.id,
				authToken: token,
				modalType: "new",
				playlistId: null,
			});
			setNewPlaylistVisible(false);
		},
		[auth?.user.id, token, createNewPlaylist]
	);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior='close'
			/>
		),
		[]
	);

	useEffect(() => {
		if (visible) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [visible]);

	const handleDismiss = useCallback(() => {
		onClose();
	}, [onClose]);

	const handleOpenNewPlaylist = useCallback(() => {
		setNewPlaylistVisible(true);
	}, []);

	if (!isFetched) return null;

	return (
		<>
			<BottomSheetModal
				ref={bottomSheetRef}
				index={1}
				snapPoints={snapPoints}
				backdropComponent={renderBackdrop}
				backgroundStyle={styles.sheetBackground}
				handleIndicatorStyle={styles.hiddenIndicator}
				enablePanDownToClose
				onDismiss={handleDismiss}
				style={styles.bottomSheetModal}>
				<BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
					<View style={styles.sheetInner}>
						<ModalGestureLine />
						<TouchableOpacity
							style={styles.addPlaylistContainer}
							onPress={handleOpenNewPlaylist}>
							<Image source={AddPlaylist} style={styles.addPlaylistImage} />
							<View style={styles.addPlaylistTextWrapper}>
								<Text style={styles.addPlaylistTitle}>Nouvelle Playlist</Text>
							</View>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>Choisis une playlist.</Text>
						{playlistsData?.data?.length ? (
							<BottomSheetScrollView
								contentContainerStyle={styles.playlistsContainer}
								showsVerticalScrollIndicator={false}>
								{playlistsData.data.map((playlist) => (
									<View key={playlist.id} style={styles.playlistItemWrapper}>
										{playlist.attributes.inPlaylist && (
											<View style={styles.disabledOverlay} />
										)}
										<Pressable
											onPress={() => handleSubmitToPlaylist(playlist.id)}
											style={styles.playlistRow}
											disabled={playlist.attributes.inPlaylist}>
											<PlaylistDisplayImage
												image={playlist.attributes.selectedColor}
												title={playlist.attributes.name}
												width={50}
												height={50}
											/>
											<Text style={styles.playlistName}>
												{playlist.attributes.name}
											</Text>
										</Pressable>
									</View>
								))}
							</BottomSheetScrollView>
						) : (
							<View style={styles.emptyState}>
								<Text style={styles.emptyStateText}>
									Aucune playlist disponible.
								</Text>
							</View>
						)}
					</View>
				</BottomSheetScrollView>
			</BottomSheetModal>

			<NewPlaylistModal
				visible={newPlaylistVisible}
				onClose={() => setNewPlaylistVisible(false)}
				onSubmit={handleCreatePlaylist}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	bottomSheetModal: {
		zIndex: 99999,
		elevation: 99999,
	},
	sheetBackground: {
		backgroundColor: primaryBackground,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	hiddenIndicator: {
		opacity: 0,
		height: 0,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 24,
	},
	sheetInner: {
		paddingTop: 12,
		gap: 16,
	},
	addPlaylistContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	addPlaylistImage: {
		width: 70,
		height: 70,
	},
	addPlaylistTextWrapper: {
		flexDirection: "column",
	},
	addPlaylistTitle: {
		fontSize: FontSize18,
		fontWeight: "bold",
	},
	modalTitle: {
		fontSize: FontSize18,
		fontWeight: "bold",
		marginTop: 10,
	},
	playlistsContainer: {
		paddingBottom: 60,
		gap: 8,
	},
	playlistItemWrapper: {
		position: "relative",
	},
	playlistRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: 8,
		gap: 12,
	},
	playlistName: {
		fontWeight: "bold",
		fontSize: FontSize16,
	},
	disabledOverlay: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		borderRadius: 10,
		backgroundColor: "rgba(220,220,220,0.7)",
		zIndex: 1,
	},
	emptyState: {
		paddingVertical: 40,
		alignItems: "center",
	},
	emptyStateText: {
		fontSize: FontSize16,
	},
});
