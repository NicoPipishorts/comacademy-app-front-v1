import Trash from "@/assets/imgs/icons/trash_white.png";
import Loader from "@/components/experience/loader";
import { colorRed } from "@/constants/colors";
import { FontSize12, FontSize18, FontSizeH1 } from "@/constants/fontsizes";
import useGetPlaylistById from "@/hooks/Playlistss/useGetPlaylistById";
import { NavigationType } from "@/types/general";
import PlaylistDisplayImage from "@/utils/playlist/PlaylistDisplayImage";
import ReturnButton from "@/utils/returnButton";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useRef, useState } from "react";
import {
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
	SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

const PlaylistList = () => {
	const { playlistId } = useLocalSearchParams();
	const navigation = useNavigation<NavigationType>();
	const playlistIdNumber = playlistId ? Number(playlistId) : null;

	const { data: playlistData, isFetched } =
		useGetPlaylistById(playlistIdNumber);

	const [openedSwipeable, setOpenedSwipeable] = useState(null);
	const swipeableRefs = useRef({}); // Store refs for all swipeables

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

	function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
		const styleAnimation = useAnimatedStyle(() => {
			return {
				transform: [{ translateX: drag.value + 80 }],
				alignItems: "center",
				justifyContent: "center",
			};
		});

		return (
			<Reanimated.View style={styleAnimation}>
				<Pressable
					onPress={() => {
						console.log("click on button");
					}}
					style={styles.rightAction}>
					<Image source={Trash} style={{ width: 24, height: 24 }} />
				</Pressable>
			</Reanimated.View>
		);
	}

	return (
		<View style={styles.wrapper}>
			<ReturnButton />

			<View style={styles.headerContainer}>
				<View>
					<PlaylistDisplayImage
						title={playlistData.data.attributes.name}
						image={playlistData.data.attributes.selectedColor}
						width={70}
						height={70}
					/>
				</View>
				<View style={styles.headerTextContainer}>
					<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
						Playlist
					</Text>
					<Text style={{ fontSize: FontSizeH1, fontWeight: "bold" }}>
						{playlistData.data.attributes.name}
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
							gap: 25,
						}}
						showsVerticalScrollIndicator={false}>
						{playlistContents.map((content) => {
							const refKey = `swipeable-${content.id}`; // Unique key for each swipeable
							if (!swipeableRefs.current[refKey]) {
								swipeableRefs.current[refKey] = React.createRef();
							}

							return (
								<ReanimatedSwipeable
									key={content.id}
									ref={swipeableRefs.current[refKey]}
									friction={2}
									enableTrackpadTwoFingerGesture
									rightThreshold={40}
									renderRightActions={RightAction}
									onSwipeableWillOpen={() => {
										if (
											openedSwipeable &&
											openedSwipeable !== swipeableRefs.current[refKey].current
										) {
											openedSwipeable.close();
										}
										setOpenedSwipeable(swipeableRefs.current[refKey].current);
									}}>
									<Pressable
										style={{
											flexDirection: "row",
											alignItems: "center",
										}}
										onPress={() => handlePress(content.group, content.itemId)}>
										<View>
											<PlaylistDisplayImage
												image={playlistData.data.attributes.selectedColor}
												width={70}
												height={70}
											/>
										</View>
										<View style={{ gap: 6 }}>
											<Text
												style={{
													fontSize: FontSize18,
													fontWeight: "bold",
													textTransform: "capitalize",
												}}>
												{content.group}
											</Text>
											<Text
												style={{ fontSize: FontSize12, fontWeight: "bold" }}>
												{content.value}
											</Text>
										</View>
									</Pressable>
								</ReanimatedSwipeable>
							);
						})}
					</ScrollView>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	rightAction: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: 55,
		width: 80,
		backgroundColor: colorRed,
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
		flexShrink: 1,
		gap: 10,
	},
	contentContainer: {
		flex: 1,
		paddingBottom: 70,
	},
	contentContainerEmpty: {
		flexGrow: 1,
		minWidth: "80%",
		justifyContent: "center",
		alignItems: "center",
	},
});

export default PlaylistList;
