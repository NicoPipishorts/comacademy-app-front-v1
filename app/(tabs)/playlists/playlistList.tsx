import { useRemoveFromPlaylist } from "@/api/playlist/removeFromPlaylist";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import { colorRed } from "@/constants/colors";
import { FontSize12, FontSize18, FontSizeH1 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import { truncateString } from "@/helpers/truncateText";
import useGetPlaylistById from "@/hooks/Playlistss/useGetPlaylistById";
import { queryClient } from "@/hooks/reactQueryConfig";
import useJwtToken from "@/hooks/useJwtToken";
import { NavigationType } from "@/types/general";
import PlaylistDisplayImage from "@/utils/playlist/PlaylistDisplayImage";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { AxiosError } from "axios";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useRef, useState } from "react";
import {
	Animated,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PlaylistList = () => {
	const insets = useSafeAreaInsets();
	const { token } = useJwtToken();
	const { playlistId } = useLocalSearchParams();
	const showSnackbar = useSnackbar();
	const navigation = useNavigation<NavigationType>();
	const playlistIdNumber = playlistId ? Number(playlistId) : null;

	const { data: playlistData, isFetched } =
		useGetPlaylistById(playlistIdNumber);

	const [openedSwipeable, setOpenedSwipeable] = useState(null);
	const swipeableRefs = useRef({});

	const onSuccess = () => {
		queryClient.refetchQueries({
			queryKey: ["Playlist", playlistIdNumber],
		});
		showSnackbar("L'élément a était retiré", "success");
	};

	const onError = (error: AxiosError) => {
		console.error(`Failed to create new playlist":`, error.message);
	};

	const { mutate: removeFromPlaylist } = useRemoveFromPlaylist(
		onSuccess,
		onError
	);

	if (!playlistData && !isFetched) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<Loader />
			</View>
		);
	}

	const playlistContents = playlistData.data.attributes.playlist_contents;

	const handlePress = (type: string, value: number) => {
		switch (type) {
			case "métier":
				navigation.navigate("favoriteMetierDetails", {
					metierId: value,
				});
				break;
			case "dico":
				navigation.navigate("favoriteDicoDetails", {
					dicoId: value,
				});
				break;
			case "question":
				navigation.navigate("favoriteQuestionDetails", {
					questionId: value,
				});
				break;
		}
	};

	const handleOutsidePress = () => {
		// Close the currently opened swipeable card
		if (openedSwipeable) {
			openedSwipeable.close();
			setOpenedSwipeable(null);
		}
	};

	function RightAction(dragX, elementId) {
		const trans = dragX.interpolate({
			inputRange: [-80, 0],
			outputRange: [0, 80],
			extrapolate: "clamp",
		});

		return (
			<Animated.View
				style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
				<Pressable
					onPress={() => {
						removeFromPlaylist({ elementId, authToken: token });
					}}
					style={styles.rightAction}>
					<Image
						source={require("@/assets/imgs/icons/trash_white.png")}
						style={{ width: 24, height: 24 }}
					/>
				</Pressable>
			</Animated.View>
		);
	}

	return (
		<SwipeToGoBack>
			<TouchableWithoutFeedback onPress={handleOutsidePress} accessible={false}>
				<View style={styles.wrapper}>
					<ReturnButton />

					<Pressable>
						<Image
							source={require("@/assets/imgs/icons/pencil.png")}
							style={{
								position: "absolute",
								top: insets.top + 15,
								right: 30,
								width: 25,
								height: 25,
							}}
						/>
					</Pressable>

					<View style={styles.headerContainer}>
						<View>
							<PlaylistDisplayImage
								title={playlistData.data.attributes.name}
								image={playlistData.data.attributes.selectedColor}
								width={100}
								height={100}
							/>
						</View>
						<View style={styles.headerTextContainer}>
							<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
								Playlist
							</Text>
							<Text style={{ fontSize: FontSizeH1, fontWeight: "bold" }}>
								{truncateString(playlistData.data.attributes.name, 16)}
							</Text>
							<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
								{playlistContents.length} éléments
							</Text>
						</View>
					</View>

					<View style={styles.contentContainer}>
						{playlistContents.length <= 0 && (
							<View style={styles.contentContainerEmpty}>
								<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
									Ta playlist est vide.
								</Text>
							</View>
						)}
						{playlistContents.length > 0 && (
							<ScrollView
								contentContainerStyle={{
									paddingTop: 50,
									paddingBottom: 30,
									minWidth: "100%",
								}}
								showsVerticalScrollIndicator={false}>
								{playlistContents.map((content) => {
									const refKey = `swipeable-${content.id}`;
									if (!swipeableRefs.current[refKey]) {
										swipeableRefs.current[refKey] = React.createRef();
									}

									return (
										<Swipeable
											key={content.id}
											ref={(ref) => (swipeableRefs.current[content.id] = ref)}
											friction={2}
											enableTrackpadTwoFingerGesture
											renderRightActions={(progress, dragX) =>
												RightAction(dragX, content.id)
											}
											onSwipeableWillOpen={() => {
												if (
													openedSwipeable &&
													openedSwipeable !== swipeableRefs.current[content.id]
												) {
													openedSwipeable.close();
												} else {
													setOpenedSwipeable(swipeableRefs.current[content.id]);
												}
											}}>
											<Pressable
												style={{
													flexDirection: "row",
													alignItems: "center",
													// borderBottomColor: colorGrey,
													// paddingVertical: 10,
													// borderBottomWidth: 1,
												}}
												onPress={() =>
													handlePress(content.group, content.itemId)
												}>
												<View>
													<PlaylistDisplayImage
														image={playlistData.data.attributes.selectedColor}
														width={70}
														height={70}
													/>
												</View>
												<View style={{ gap: 4, flexShrink: 1 }}>
													<Text
														style={{
															fontSize: FontSize18,
															fontWeight: "bold",
															textTransform: "capitalize",
														}}>
														{content.group}
													</Text>
													<Text
														style={{
															fontSize: FontSize12,
															fontWeight: "bold",
														}}>
														{truncateString(content.value, 100)}
													</Text>
												</View>
											</Pressable>
										</Swipeable>
									);
								})}
							</ScrollView>
						)}
					</View>
				</View>
			</TouchableWithoutFeedback>
		</SwipeToGoBack>
	);
};

const styles = StyleSheet.create({
	rightAction: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
		maxWidth: 80,
		minWidth: 80,
		backgroundColor: colorRed,
		borderRadius: 8,
	},
	wrapper: {
		padding: 20,
		paddingHorizontal: 25,
		flex: 1,
		alignItems: "flex-start",
		justifyContent: "flex-start",
	},
	headerContainer: {
		display: "flex",
		flexDirection: "row",
		paddingTop: 20,
		paddingBottom: 20,
	},
	headerTextContainer: {
		justifyContent: "center",
		flexShrink: 1,
		gap: 10,
	},
	contentContainer: {
		flex: 1,
		paddingBottom: 70,
	},
	contentContainerEmpty: {
		flexGrow: 1,
		minWidth: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
});

export default PlaylistList;
