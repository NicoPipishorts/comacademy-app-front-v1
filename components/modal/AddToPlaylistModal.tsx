import { useAddToPlaylist } from "@/api/addToPlaylist";
import { primaryBackground } from "@/constants/colors";
import { FontSize14, FontSize18 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import useGetPlaylistsByUser from "@/hooks/Playlistss/useGetPlaylistsByUser";
import { queryClient } from "@/hooks/reactQueryConfig";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import PlaylistDisplayImage from "@/utils/playlist/PlaylistDisplayImage";
import { AxiosError } from "axios";
import React, { useCallback, useEffect, useRef } from "react";
import {
	Animated,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

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
	const { userId } = useUserId();
	const { token } = useJwtToken();

	const { data: playlistsData, isFetched } = useGetPlaylistsByUser(userId);

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

	const showSnackbar = useSnackbar();

	const onSuccess = (data: any) => {
		queryClient.refetchQueries({
			queryKey: ["Playlists"],
		});
		showSnackbar("L'élément a était ajouté a la playlist.", "success");
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
							<Text style={styles.modalTitle}> Choisis une playlist :</Text>
							<ScrollView contentContainerStyle={{ gap: 15 }}>
								{playlistsData.data.map((playlist) => {
									return (
										<Pressable
											key={playlist.id}
											onPress={() => handleSubmit(playlist.id)}
											style={{ flexDirection: "row", alignItems: "center" }}>
											<PlaylistDisplayImage
												image={playlist.attributes.selectedColor}
												title={playlist.attributes.name}
												width={40}
												height={40}
											/>
											<Text
												style={{ fontWeight: "bold", fontSize: FontSize14 }}>
												{playlist.attributes.name}
											</Text>
										</Pressable>
									);
								})}
							</ScrollView>
						</TouchableOpacity>
					</Animated.View>
				</View>
			</TouchableOpacity>
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
		marginBottom: 20,
		textAlign: "left",
	},
});
