import { colorBlue, colorRed, primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import PlaylistDisplayImage from "@/utils/playlist/PlaylistDisplayImage";
import { useNavigation } from "expo-router";
import React from "react";
import {
	Image,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
	SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

interface Props {
	id: number;
	title: string;
	color: string;
	refKey: string;
	openedSwipeable: any;
	setOpenedSwipeable: React.Dispatch<boolean>;
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

	function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
		const styleAnimation = useAnimatedStyle(() => {
			return {
				transform: [{ translateX: drag.value + 160 }],
				alignItems: "center",
				justifyContent: "center",
			};
		});

		return (
			<Reanimated.View style={styleAnimation}>
				<View style={styles.rightActionContainer}>
					<Pressable
						style={[styles.rightAction, styles.actionEdit]}
						onPress={() => {
							handleEditPlaylist(id);
						}}>
						<Image
							source={require("@/assets/imgs/icons/pencil_white.png")}
							style={{ width: 24, height: 24 }}
						/>
					</Pressable>
					<Pressable
						style={[styles.rightAction, styles.actionDelete]}
						onPress={() => handDeletePlaylist(id)}>
						<Image
							source={require("@/assets/imgs/icons/trash_white.png")}
							style={{ width: 24, height: 24 }}
						/>
					</Pressable>
				</View>
			</Reanimated.View>
		);
	}

	return (
		<>
			<ReanimatedSwipeable
				key={id}
				enableTrackpadTwoFingerGesture
				rightThreshold={40}
				friction={2}
				ref={(ref) => (swipeableRefs.current[id] = ref)}
				renderRightActions={(prog, drag) => RightAction(prog, drag)}
				onSwipeableWillOpen={() => {
					// Close any other open swipeable and set the current one as open
					if (
						openedSwipeable &&
						openedSwipeable !== swipeableRefs.current[id]
					) {
						openedSwipeable.close();
						setOpenedSwipeable(null);
					}
					setOpenedSwipeable(swipeableRefs.current[id]);
				}}>
				<TouchableOpacity style={styles.wrapper} onPress={() => handlePress()}>
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
						<Text style={{ fontSize: FontSize12 }}>" I like it !! "</Text>
					</View>
				</TouchableOpacity>
			</ReanimatedSwipeable>
		</>
	);
}

const styles = StyleSheet.create({
	rightActionContainer: {
		flexDirection: "row",
		flex: 1,
		width: 160,
		borderLeftColor: primaryBackground,
	},
	rightAction: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: "50%",
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
