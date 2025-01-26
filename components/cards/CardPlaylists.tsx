import { colorBlue, colorRed } from "@/constants/colors";
import { FontSize18 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import PlaylistDisplayImage from "@/utils/playlist/PlaylistDisplayImage";
import { useNavigation } from "expo-router";
import React from "react";
import {
	Animated,
	Image,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

interface Props {
	id: number;
	title: string;
	color: string;
	refKey: string;
	openedSwipeable: any;
	setOpenedSwipeable: React.Dispatch<any>;
	swipeableRefs: React.MutableRefObject<{}>;
	handDeletePlaylist: (id: number) => void;
	handleEditPlaylist: (id: number) => void;
}

export default function CardPlaylist({
	title,
	color,
	id,
	openedSwipeable,
	setOpenedSwipeable,
	swipeableRefs,
	handDeletePlaylist,
	handleEditPlaylist,
}: Props) {
	const navigation = useNavigation<NavigationType>();

	const handlePress = () => {
		navigation.navigate("playlistList", { playlistId: id });
	};

	const closeSwipeable = () => {
		if (openedSwipeable) {
			openedSwipeable.close();
			setOpenedSwipeable(null);
		}
	};

	const renderRightActions = (
		progress: Animated.AnimatedInterpolation<number>
	) => {
		// Animate the buttons as you swipe
		const translateX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [160, 0], // Buttons slide in from the right
		});

		return (
			<View style={styles.rightActionContainer}>
				<Animated.View
					style={[
						styles.actionEdit,
						styles.actionButton,
						{ transform: [{ translateX }] },
					]}>
					<Pressable
						style={styles.rightAction}
						onPress={() => {
							handleEditPlaylist(id);
							closeSwipeable();
						}}>
						<Image
							source={require("@/assets/imgs/icons/pencil_white.png")}
							style={{ width: 24, height: 24 }}
						/>
					</Pressable>
				</Animated.View>
				<Animated.View
					style={[
						styles.actionDelete,
						styles.actionButton,
						{ transform: [{ translateX }] },
					]}>
					<Pressable
						style={styles.rightAction}
						onPress={() => {
							handDeletePlaylist(id);
							closeSwipeable();
						}}>
						<Image
							source={require("@/assets/imgs/icons/trash_white.png")}
							style={{ width: 24, height: 24 }}
						/>
					</Pressable>
				</Animated.View>
			</View>
		);
	};

	return (
		<View
			style={{
				flex: 1,
			}}>
			<Swipeable
				key={id}
				ref={(ref) => (swipeableRefs.current[id] = ref)}
				friction={2}
				rightThreshold={40}
				renderRightActions={(progress) => renderRightActions(progress)}
				onSwipeableWillOpen={() => {
					if (
						openedSwipeable &&
						openedSwipeable !== swipeableRefs.current[id]
					) {
						openedSwipeable.close();
					}
					setOpenedSwipeable(swipeableRefs.current[id]);
				}}
				onSwipeableClose={() => {
					setOpenedSwipeable(null);
				}}>
				<TouchableOpacity
					style={styles.wrapper}
					onPress={() => {
						handlePress();
						closeSwipeable(); // Close swipeable when card is pressed
					}}>
					<PlaylistDisplayImage
						title={title}
						image={color}
						width={70}
						height={70}
					/>
					<View style={{ flexDirection: "column" }}>
						<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
							{title}
						</Text>
					</View>
				</TouchableOpacity>
			</Swipeable>
		</View>
	);
}

const styles = StyleSheet.create({
	rightActionContainer: {
		flexDirection: "row",
		maxWidth: 160,
	},
	rightAction: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		minHeight: "100%",
		minWidth: "100%",
	},
	actionButton: {
		width: "50%",
		borderRadius: 5,
		marginVertical: 10,
		justifyContent: "center",
	},
	actionDelete: {
		backgroundColor: colorRed,
	},
	actionEdit: {
		backgroundColor: colorBlue,
	},
	wrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 12,
	},
});
