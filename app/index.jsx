import React from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import ALaUne from "../components/ALaUne";

// Custom images
import dico from "../assets/imgs/cards/home_dico.png";
import playlists from "../assets/imgs/cards/home_my_playlists.png";
import stats from "../assets/imgs/cards/home_my_stats.png";
import play from "../assets/imgs/cards/home_play.png";

import actus from "../assets/imgs/cards/home_actus.png";
import briefs from "../assets/imgs/cards/home_briefs.png";
import citations from "../assets/imgs/cards/home_citations.png";
import un_pour_un from "../assets/imgs/cards/home_un_pour_un.png";

const AppIndex = () => {
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Hello Arnaud</Text>
				<Image
					source={{ uri: "path_to_your_image" }}
					style={styles.profileImage}
				/>
			</View>

			<ScrollView
				style={styles.contentContainer}
				showsVerticalScrollIndicator={true}>
				<View style={styles.header}>
					<Text style={styles.headerShortcuts}>Raccourcis</Text>
				</View>
				<ScrollView style={styles.shortcutsContainer} horizontal={true}>
					<View style={styles.shortcuts}>
						<TouchableOpacity style={styles.button}>
							<Image source={stats} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={playlists} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={dico} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={play} style={styles.shortcutsCards} />
						</TouchableOpacity>
					</View>
				</ScrollView>

				<View style={styles.header}>
					<Text style={styles.headerShortcuts}>En ce moment</Text>
				</View>
				<ScrollView style={styles.shortcutsContainer} horizontal={true}>
					<View style={styles.shortcuts}>
						<TouchableOpacity style={styles.button}>
							<Image source={actus} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={briefs} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={un_pour_un} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={citations} style={styles.shortcutsCards} />
						</TouchableOpacity>
					</View>
				</ScrollView>

				<ScrollView style={styles.shortcutsContainer} horizontal={true}>
					<View style={styles.shortcuts}>
						<ALaUne content='Notre 10 000eme Utilisateur' />
					</View>
				</ScrollView>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		paddingTop: 100,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	headerText: {
		fontSize: 22,
		fontWeight: "bold",
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
	},
	contentContainer: {
		flex: 1, // Control layout with flex
	},
	headerShortcuts: {
		fontSize: 26,
		fontWeight: "bold",
	},
	shortcutsContainer: {
		flexGrow: 0, // Control layout with flex
	},
	shortcuts: {
		flexDirection: "row",
		justifyContent: "flex-start",
		minWidth: "100%",
		marginBottom: 40,
	},
	shortcutsCards: {
		width: 125,
		height: 100,
	},
	button: {
		alignItems: "center",
		marginRight: 20,
	},
});

export default AppIndex;
