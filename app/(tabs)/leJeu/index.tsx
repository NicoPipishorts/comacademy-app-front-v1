import { primaryBackground } from "@/constants/colors";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FloatingTabBar from "../../../components/FloatingTabBar";
import ScreenHeaders from "../../../components/ScreenHeaders";

// Assets
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { useTab } from "@/context/floatingTabbarContext";
import { useNavigation } from "expo-router";
import PlayButton from "../../../assets/imgs/BigPlayButton.png";

export type NavigationType = {
	navigate: (screenName: string) => void;
};

const LeJeu = () => {
	const { selectedTab, setSelectedTab } = useTab();
	const navigation = useNavigation<NavigationType>();
	const handlePress = () => {
		navigation.navigate("Jeu");
	};

	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Le Jeu' />

			<View style={styles.wrapperCenter}>
				<View>
					<Text style={styles.centerTitle}>A toi de jouer !</Text>
				</View>
				<View style={styles.playButtonContainer}>
					<TouchableOpacity onPress={handlePress}>
						<Image
							source={PlayButton}
							resizeMode='contain'
							style={styles.playButton}
						/>
					</TouchableOpacity>
				</View>

				<View style={styles.floatingTabbarContainer}>
					<FloatingTabBar
						selectedTab={selectedTab}
						setSelectedTab={setSelectedTab}
						values={{ btn1: "Aléatoire", btn2: "Catégories" }}
					/>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
	},
	wrapperCenter: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "flex-start",
		marginBottom: 83,
		paddingTop: "35%",
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

export default LeJeu;
