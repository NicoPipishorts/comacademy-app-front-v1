import { useAddToPlaylist } from "@/api/playlist/addToPlaylist";
import { primaryBackground } from "@/constants/colors";
import { FontSize16, FontSize18 } from "@/constants/fontsizes";
import useGetPlaylistsForElement from "@/hooks/Playlistss/useGetPlaylistsByElement";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ModalGestureLine from "../experience/modalGestureLine";

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
	const insets = useSafeAreaInsets();
	const slideAnim = useRef(new Animated.Value(300)).current;
	const { userId } = useUserId();
	const { token } = useJwtToken();

	const { data: playlistsData, isFetched } = useGetPlaylistsForElement(
		userId,
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
							<Text style={styles.modalTitle}> Choisis une playlist.</Text>
							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={{
									paddingBottom: insets.bottom + 30,
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
		textAlign: "center",
	},
});
