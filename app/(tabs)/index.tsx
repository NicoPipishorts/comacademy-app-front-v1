import ALaUne from "@/components/ALaUne";
import React from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Custom images
import { primaryBackground } from "@/constants/colors";
import { FontSizeAvaterText, FontSizeH1 } from "@/constants/fontsizes";

import commandements from "@/assets/imgs/cards/home_10_commandements.png";
import secrets from "@/assets/imgs/cards/home_3_secrets.png";
import homeActusDis from "@/assets/imgs/cards/home_actus_dis.png";
import lesCitations from "@/assets/imgs/cards/home_citations.png";
import dico from "@/assets/imgs/cards/home_dico.png";
import homeFlopsDis from "@/assets/imgs/cards/home_flops_dis.png";
import histoires from "@/assets/imgs/cards/home_histoire.png";
import homeJouer from "@/assets/imgs/cards/home_jouer.png";
import mesStats from "@/assets/imgs/cards/home_mes_stats.png";
import metiers from "@/assets/imgs/cards/home_metiers.png";
import AvatarInitials from "@/components/avatars/initials";
import Loader from "@/components/experience/loader";
import useGetUserInfo from "@/hooks/userUserInfo";
import useUserId from "@/hooks/useUserId";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HomeScreen = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const { userId } = useUserId();
	const { data: userData } = useGetUserInfo(userId);

	if (!userData) {
		return <Loader />;
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.navigate("user")}>
					<Text style={styles.headerText}>Hello {userData.firstName}</Text>
				</TouchableOpacity>
				<View style={{ marginTop: 10, marginRight: 10 }}>
					<AvatarInitials
						firstName={userData.firstName}
						lastName={userData.lastName}
					/>
				</View>
			</View>

			<ScrollView
				style={styles.contentContainer}
				showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<Text style={styles.headerShortcuts}>Accès rapide</Text>
				</View>
				<ScrollView
					style={styles.shortcutsContainer}
					horizontal={true}
					showsHorizontalScrollIndicator={false}>
					<View style={styles.shortcuts}>
						<TouchableOpacity
							style={styles.cardsButton}
							onPress={() => navigation.navigate("leJeu")}>
							<View style={styles.imageContainer}>
								<Image
									source={homeJouer}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.cardsButton}
							onPress={() => navigation.navigate("dico")}>
							<View style={styles.imageContainer}>
								<Image
									source={dico}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.cardsButton}
							onPress={() => navigation.navigate("user")}>
							<View style={styles.imageContainer}>
								<Image
									source={mesStats}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.cardsButton}
							onPress={() => navigation.navigate("metiers")}>
							<View style={styles.imageContainer}>
								<Image
									source={metiers}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
					</View>
				</ScrollView>

				<View style={styles.header}>
					<Text style={styles.headerShortcuts}>Découvrir</Text>
				</View>
				<ScrollView
					style={styles.shortcutsContainer}
					horizontal={true}
					showsHorizontalScrollIndicator={false}>
					<View style={styles.shortcuts}>
						<TouchableOpacity
							style={styles.cardsButton}
							onPress={() => navigation.navigate("lesCitations")}>
							<View style={styles.imageContainer}>
								<Image
									source={lesCitations}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.cardsButton}
							onPress={() => navigation.navigate("secrets")}>
							<View style={styles.imageContainer}>
								<Image
									source={secrets}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.cardsButton}
							onPress={() => navigation.navigate("commandements")}>
							<View style={styles.imageContainer}>
								<Image
									source={commandements}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.cardsButton}
							// onPress={() => navigation.navigate("secrets")}
						>
							<View style={styles.imageContainer}>
								<Image
									source={histoires}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
						<TouchableOpacity style={styles.cardsButton}>
							<View style={styles.imageContainer}>
								<Image
									source={homeFlopsDis}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
						<TouchableOpacity style={styles.cardsButton}>
							<View style={styles.imageContainer}>
								<Image
									source={homeActusDis}
									style={styles.shortcutsCards}
									resizeMode='contain'
								/>
							</View>
						</TouchableOpacity>
					</View>
				</ScrollView>

				<View style={styles.header}>
					<Text style={styles.headerShortcuts}>A la une</Text>
				</View>
				<View style={styles.alLaUneContainer}>
					<View style={styles.alLaUne}>
						<ALaUne content='Notre 10 000eme Utilisateur' />
						{/* <ALaUne content='Notre 10 000eme Utilisateur' /> */}
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingBottom: 20,
		backgroundColor: primaryBackground,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
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
	cardsButton: {
		position: "relative",
		padding: 0,
		marginRight: 20,
		width: 127,
		height: 110,
	},
	imageContainer: {
		width: "100%",
		height: "100%",
	},
	shortcutsCards: {
		alignItems: "flex-end",
		width: "100%",
		height: "100%",
	},
});

export default HomeScreen;
