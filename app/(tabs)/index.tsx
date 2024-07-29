import React from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useAuth } from "../../auth/AuthContext";
import ALaUne from "../../components/ALaUne";

// Custom images
import { primaryBackground } from "@/constants/colors";
import { FontSizeAvaterText, FontSizeH1 } from "@/constants/fontsizes";
import avatar from "../../assets/imgs/avatar/avatar.png";

import dixAstuces from "../../assets/imgs/cards/home_10_astuces.png";
import secrets from "../../assets/imgs/cards/home_3_secrets.png";
import homeActus from "../../assets/imgs/cards/home_actus.png";
import lesBrieds from "../../assets/imgs/cards/home_briefs.png";
import lesCitations from "../../assets/imgs/cards/home_citations.png";
import homeCreme from "../../assets/imgs/cards/home_creme.png";
import homeFlops from "../../assets/imgs/cards/home_flops.png";
import mesStats from "../../assets/imgs/cards/home_mes_stats.png";

const HomeScreen = () => {
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
					<Text style={styles.headerShortcuts}>Let's Go</Text>
				</View>
				<ScrollView
					style={styles.shortcutsContainer}
					horizontal={true}
					showsHorizontalScrollIndicator={false}>
					<View style={styles.shortcuts}>
						<TouchableOpacity style={styles.button}>
							<Image source={secrets} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={homeFlops} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={lesCitations} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={homeActus} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={mesStats} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={dixAstuces} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={lesBrieds} style={styles.shortcutsCards} />
						</TouchableOpacity>
						<TouchableOpacity style={styles.button}>
							<Image source={homeCreme} style={styles.shortcutsCards} />
						</TouchableOpacity>
					</View>
				</ScrollView>

				{/* <View style={styles.header}>
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
				</ScrollView> */}

				<View style={styles.header}>
					<Text style={styles.headerShortcuts}>A la une</Text>
				</View>
				<ScrollView
					style={styles.alLaUneContainer}
					horizontal={true}
					showsHorizontalScrollIndicator={false}>
					<View style={styles.alLaUne}>
						<ALaUne content='Notre 10 000eme Utilisateur' />
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
		paddingTop: 100,
		backgroundColor: primaryBackground,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 30,
		paddingHorizontal: 20,
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
		paddingHorizontal: 20,
	},
	shortcuts: {
		flexDirection: "row",
		justifyContent: "flex-start",
		minWidth: "100%",
		marginBottom: 40,
	},
	alLaUneContainer: {
		flexDirection: "column",
		flexGrow: 0,
		paddingHorizontal: 20,
	},
	alLaUne: {
		flexDirection: "column",
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
