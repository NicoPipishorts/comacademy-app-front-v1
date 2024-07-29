import {
	colorBlack,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import React, { useState } from "react";
import {
	Image,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import FloatingTabBar from "../../../components/FloatingTabBar";

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
	const [isEnabled, setIsEnabled] = useState(false);
	const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
	const navigation = useNavigation<NavigationType>();
	const handlePress = () => {
		navigation.navigate("jeu");
	};

	return (
		<View style={styles.wrapper}>
			<View style={styles.containerHeader}>
				<View style={styles.header}>
					<Text style={styles.headerMainText}>Le Jeu</Text>
				</View>
				<View style={styles.containerSwitch}>
					<Text style={styles.textJouer}>Jouer</Text>
					<Switch
						trackColor={{ false: colorBlack, true: colorYellow }}
						ios_backgroundColor={colorBlack}
						thumbColor={colorWhite}
						onValueChange={toggleSwitch}
						value={isEnabled}
					/>
					<Text style={styles.textReponses}>Réponses</Text>
				</View>
			</View>

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
	containerHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignContent: "center",
	},
	header: {
		paddingVertical: 15,
	},
	headerMainText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	containerSwitch: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
	},
	textJouer: {
		paddingRight: 8,
		fontWeight: "bold",
	},
	textReponses: {
		paddingLeft: 8,
		fontWeight: "bold",
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
