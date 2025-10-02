import { colorBlue, colorRed, colorWhite } from "@/constants/colors";
import { FontSize14, FontSize18 } from "@/constants/fontsizes";
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
		progress: Animated.AnimatedInterpolation<number>,
		_dragAnimatedValue: Animated.AnimatedInterpolation<number>
	) => {
		const editTranslate = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [80, 0],
		});

		const deleteTranslate = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [160, 0],
		});

		const scale = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [0.8, 1],
		});

		return (
			<View style={styles.rightActionContainer}>
				<Animated.View
					style={[
						styles.actionButton,
						styles.actionEdit,
						{
							transform: [{ translateX: editTranslate }, { scale }],
						},
					]}>
					<Pressable
						style={styles.rightAction}
						onPress={() => {
							handleEditPlaylist(id);
							closeSwipeable();
						}}
						android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}>
						<Image
							source={require("@/assets/imgs/icons/pencil_white.png")}
							style={styles.actionIcon}
						/>
						<Text style={styles.actionText}>Edit</Text>
					</Pressable>
				</Animated.View>
				<Animated.View
					style={[
						styles.actionButton,
						styles.actionDelete,
						{
							transform: [{ translateX: deleteTranslate }, { scale }],
						},
					]}>
					<Pressable
						style={styles.rightAction}
						onPress={() => {
							handDeletePlaylist(id);
							closeSwipeable();
						}}
						android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}>
						<Image
							source={require("@/assets/imgs/icons/trash_white.png")}
							style={styles.actionIcon}
						/>
						<Text style={styles.actionText}>Delete</Text>
					</Pressable>
				</Animated.View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Swipeable
				key={id}
				ref={(ref) => {
					swipeableRefs.current[id] = ref;
				}}
				friction={2}
				overshootRight={false}
				rightThreshold={40}
				renderRightActions={renderRightActions}
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
					style={styles.cardContainer}
					activeOpacity={0.7}
					onPress={() => {
						handlePress();
						closeSwipeable();
					}}>
					<View style={styles.cardContent}>
						<PlaylistDisplayImage
							title={title}
							image={color}
							width={70}
							height={70}
						/>
						<View style={styles.textContainer}>
							<Text style={styles.title}>{title}</Text>
						</View>
					</View>
				</TouchableOpacity>
			</Swipeable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 8,
	},
	cardContainer: {
		backgroundColor: "transparent",
		borderRadius: 12,
	},
	cardContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		paddingLeft: 0,
	},
	textContainer: {
		flex: 1,
		marginLeft: 16,
	},
	title: {
		fontSize: FontSize18,
		fontWeight: "600",
		color: "#000",
	},
	rightActionContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 8,
	},
	actionButton: {
		width: 80,
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 12,
	},
	rightAction: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
		paddingHorizontal: 12,
	},
	actionIcon: {
		width: 22,
		height: 22,
		marginBottom: 4,
	},
	actionText: {
		color: colorWhite,
		fontSize: FontSize14,
		fontWeight: "600",
	},
	actionEdit: {
		backgroundColor: colorBlue,
		marginRight: 4,
	},
	actionDelete: {
		backgroundColor: colorRed,
	},
});
