import { primaryBackground } from "@/constants/colors";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import FloatingTabBar from "../../../components/FloatingTabBar";
import ScreenHeaders from "../../../components/ScreenHeaders";

// Assets
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { useTab } from "@/context/floatingTabbarContext";
import PlayButton from "../../../assets/imgs/BigPlayButton.png";

const LeJeu = () => {
	const { selectedTab, setSelectedTab } = useTab();
	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Le Jeu' />

			<View style={styles.wrapperCenter}>
				<View>
					<Text style={styles.centerTitle}>A toi de jouer !</Text>
				</View>
				<View style={styles.playButtonContainer}>
					{/* <Link href='/leJeu'> */}
					<Image
						source={PlayButton}
						resizeMode='contain'
						style={styles.playButton}
					/>
					{/* </Link> */}
				</View>

				<View style={styles.floatingTabbarContainer}>
					<FloatingTabBar
						selectedTab={selectedTab}
						setSelectedTab={setSelectedTab}
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
		justifyContent: "center",
		marginBottom: 120,
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
