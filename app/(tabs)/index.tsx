import React from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useAuth } from "../../auth/AutContext";
import ALaUne from "../../components/ALaUne";

// Custom images
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/cards/home_d... Remove this comment to see the full error message
import dico from "../../assets/imgs/cards/home_dico.png";
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/cards/home_m... Remove this comment to see the full error message
import playlists from "../../assets/imgs/cards/home_my_playlists.png";
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/cards/home_m... Remove this comment to see the full error message
import stats from "../../assets/imgs/cards/home_my_stats.png";
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/cards/home_p... Remove this comment to see the full error message
import play from "../../assets/imgs/cards/home_play.png";

import { primaryBackground } from "@/constants/colors";
import { FontSizeAvaterText, FontSizeH1 } from "@/constants/fontsizes";
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/avatar/avata... Remove this comment to see the full error message
import avatar from "../../assets/imgs/avatar/avatar.png";
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/cards/home_a... Remove this comment to see the full error message
import actus from "../../assets/imgs/cards/home_actus.png";
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/cards/home_b... Remove this comment to see the full error message
import briefs from "../../assets/imgs/cards/home_briefs.png";
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/cards/home_c... Remove this comment to see the full error message
import citations from "../../assets/imgs/cards/home_citations.png";
// @ts-expect-error TS(2307): Cannot find module '../../assets/imgs/cards/home_u... Remove this comment to see the full error message
import un_pour_un from "../../assets/imgs/cards/home_un_pour_un.png";

const HomeScreen = () => {
	// @ts-expect-error TS(2339): Property 'logout' does not exist on type 'null'.
	const { logout } = useAuth();

	return (
		<View style={styles.wrapper}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Hello Arnaud</Text>
				<TouchableOpacity onPress={logout}>
					<Image source={avatar} style={styles.profileImage} />
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.contentContainer}
				showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<Text style={styles.headerShortcuts}>Raccourcis</Text>
				</View>
				<ScrollView
					style={styles.shortcutsContainer}
					horizontal={true}
					showsHorizontalScrollIndicator={false}>
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
				<ScrollView
					style={styles.shortcutsContainer}
					horizontal={true}
					showsHorizontalScrollIndicator={false}>
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

				<ScrollView
					style={styles.shortcutsContainer}
					horizontal={true}
					showsHorizontalScrollIndicator={false}>
					<View style={styles.shortcuts}>
						<ALaUne content='Notre 10 000eme Utilisateur' />
					</View>
				</ScrollView>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 20,
		paddingTop: 100,
		backgroundColor: primaryBackground,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 30,
	},
	headerText: {
		fontSize: FontSizeAvaterText,
		fontWeight: "bold",
	},
	profileImage: {
		width: 90,
		height: 90,
		marginRight: 10,
	},
	contentContainer: {
		flex: 1,
		marginBottom: 80,
	},
	headerShortcuts: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
	},
	shortcutsContainer: {
		flexGrow: 0,
	},
	shortcuts: {
		flexDirection: "row",
		justifyContent: "flex-start",
		minWidth: "100%",
		marginBottom: 40,
	},
	shortcutsCards: {
		width: 127,
		height: 100,
	},
	button: {
		alignItems: "center",
		marginRight: 20,
	},
});

export default HomeScreen;
