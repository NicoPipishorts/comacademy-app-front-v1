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
import { AxiosError } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Animated,
	Image,
	Modal,
	Pressable,
	ScrollView,
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

export default function AddToPlaylistModal({
	visible,
	onClose,
	type,
	elementId,
}: Props) {
	const slideAnim = useRef(new Animated.Value(300)).current;
	const { auth } = useAuthSession();
	const { token } = useJwtToken();

	const { data: playlistsData, isFetched } = useGetPlaylistsForElement(
		auth?.user.id,
		type,
		elementId
	);

	const showModal = useCallback(() => {
		Animated.spring(slideAnim, {
			toValue: 0,
			useNativeDriver: true,
		}).start();
	}, [slideAnim]);

	const hideModal = () => {
		Animated.timing(slideAnim, {
			toValue: 300,
			duration: 200,
			useNativeDriver: true,
		}).start(() => {
			onClose();
		});
	};

	// const showSnackbar = useSnackbar();

	const onSuccess = () => {
		queryClient.refetchQueries({
			queryKey: ["Playlists"],
		});
	};

	const onError = (error: AxiosError) => {
		console.error(`Failed to create new playlist":`, error.message);
	};

	const { mutate: addToPlaylist } = useAddToPlaylist(onSuccess, onError);

	const handleSubmit = (playlistId: number) => {
		addToPlaylist({
			playlistId,
			elementId: elementId,
			type,
			authToken: token,
		});
		hideModal();
	};

	useEffect(() => {
		if (visible) {
			showModal();
		}
	}, [showModal, visible]);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [modalType, setModalType] = useState<"new" | "edit">(null);
	const [playlistId, setPlaylistId] = useState(null);
	const [openedSwipeable, setOpenedSwipeable] = useState(null);

	const showSnackbar = useSnackbar(); // Use the snackbar context

	const onSuccessCreate = (data: any, message: string) => {
		queryClient.refetchQueries({
			queryKey: ["Playlists"],
		});
		showSnackbar(message, "success");
		if (openedSwipeable) {
			openedSwipeable.close();
			setOpenedSwipeable(null);
		}
	};

	const onErrorCreate = (error: AxiosError) => {
		console.error(`Failed to create new playlist":`, error.message);
	};

	const { mutate: createNewPlaylist } = useCreateNewPlaylist(
		onSuccessCreate,
		onErrorCreate
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

	if (!isFetched) return null;

	return (
		<Modal
			animationType='none'
			transparent={true}
			visible={visible}
			onRequestClose={hideModal}>
			<TouchableOpacity
				style={styles.modalOverlay}
				activeOpacity={1}
				onPress={hideModal}>
				<View style={styles.modalWrapper}>
					<Animated.View
						style={[
							styles.modalContent,
							{
								transform: [{ translateY: slideAnim }],
							},
						]}>
						<TouchableOpacity
							activeOpacity={1}
							onPress={(e) => e.stopPropagation()}>
							<ModalGestureLine />
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
								</View>
							</TouchableOpacity>
							<Text style={styles.modalTitle}> Choisis une playlist.</Text>
							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={{
									paddingBottom: 150,
									gap: 3,
								}}>
								{playlistsData.data.map((playlist) => {
									return (
										<View key={playlist.id}>
											{playlist.attributes.inPlaylist && (
												<View
													style={{
														position: "absolute",
														minWidth: "100%",
														minHeight: 66,
														zIndex: 10,
														borderRadius: 10,
														backgroundColor: "rgba(220,220,220,0.7)",
													}}
												/>
											)}
											<Pressable
												onPress={() => handleSubmit(playlist.id)}
												style={{
													flexDirection: "row",
													alignItems: "center",
													padding: 8,
												}}
												disabled={
													playlist.attributes.inPlaylist ? true : false
												}>
												<PlaylistDisplayImage
													image={playlist.attributes.selectedColor}
													title={playlist.attributes.name}
													width={50}
													height={50}
												/>
												<Text
													style={{ fontWeight: "bold", fontSize: FontSize16 }}>
													{playlist.attributes.name}
												</Text>
											</Pressable>
										</View>
									);
								})}
							</ScrollView>
						</TouchableOpacity>
					</Animated.View>
				</View>
			</TouchableOpacity>

			<NewPlaylistModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onSubmit={handleCreatePlaylist}
				playlistId={playlistId}
			/>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalWrapper: {
		flex: 1,
		justifyContent: "flex-end",
	},
	modalContent: {
		display: "flex",
		backgroundColor: primaryBackground,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		height: 350,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	modalTitle: {
		fontSize: FontSize18,
		fontWeight: "bold",
		marginTop: 20,
		marginBottom: 10,
		marginLeft: 10,
		textAlign: "left",
	},
	addPlaylistContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	addPlaylistImage: {
		width: 70,
		height: 70,
	},
});
