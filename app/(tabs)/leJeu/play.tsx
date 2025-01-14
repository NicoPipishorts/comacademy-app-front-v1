import PlayButton from "@/assets/imgs/BigPlayButton.png";
import { FontSize16, FontSizeScreenTitles } from "@/constants/fontsizes";
import React, { Dispatch, SetStateAction } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	handlePressPlay: () => void;
	selectedTab: boolean;
	setSelectedTab: Dispatch<SetStateAction<boolean>>;
	disabled: boolean;
}

export default function LetsPlay({ handlePressPlay, disabled }: Props) {
	return (
		<View style={styles.wrapperCenter}>
			<View>
				<Text style={styles.centerTitle}>A toi de jouer !</Text>
			</View>
			<View style={styles.playButtonContainer}>
				<TouchableOpacity onPress={handlePressPlay} disabled={!disabled}>
					<Image
						source={PlayButton}
						resizeMode='contain'
						style={styles.playButton}
					/>
				</TouchableOpacity>
				{!disabled && (
					<View style={{ paddingTop: 10 }}>
						<Text style={{ fontWeight: "bold", fontSize: FontSize16 }}>
							Pas de connexion internet.
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapperCenter: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingBottom: 90,
		marginBottom: 103,
	},
	centerTitle: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		marginBottom: 30,
	},
	playButtonContainer: {
		width: "100%",
		alignItems: "center",
	},
	playButton: {
		width: "60%",
		height: undefined,
		aspectRatio: 1,
	},
	floatingTabbarContainer: {
		backgroundColor: "transparent",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		elevation: 5,
		zIndex: 1,
	},
});
