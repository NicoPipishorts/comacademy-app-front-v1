import React, { useEffect } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Custom images and constants
import commandements from "@/assets/imgs/cards/home_10_commandements.png";
import trentes from "@/assets/imgs/cards/home_30s.png";
import secrets from "@/assets/imgs/cards/home_3_secrets.png";
import homeActusDis from "@/assets/imgs/cards/home_actus_dis.png";
import lesCitations from "@/assets/imgs/cards/home_citations.png";
import dico from "@/assets/imgs/cards/home_dico.png";
import feed from "@/assets/imgs/cards/home_feed.png";
import histoires from "@/assets/imgs/cards/home_histoire.png";
import homeJouer from "@/assets/imgs/cards/home_jouer.png";
import mesStats from "@/assets/imgs/cards/home_mes_stats.png";
import metiers from "@/assets/imgs/cards/home_metiers.png";
import playlists from "@/assets/imgs/cards/home_playlists.png";
import { primaryBackground } from "@/constants/colors";
import {
	FontSize10,
	FontSize12,
	FontSizeAvaterText,
	FontSizeH1,
} from "@/constants/fontsizes";

// Components and hooks
import ALaUneCitation from "@/components/ALaUneCitation";
import ALaUneDico from "@/components/ALaUneDico";
import AvatarInitials from "@/components/avatars/initials";
import Loader from "@/components/experience/loader";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { queryClient } from "@/hooks/reactQueryConfig";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import useUserId from "@/hooks/useUserId";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HomeScreen = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const { userId } = useUserId();
	const { data: userData } = useGetUserInfo(userId);

	useTrackPageMetrics({ page: "Dashboard" });

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["Citations"] });
	}, []);

	if (!userData) {
		return <Loader />;
	}

	return (
		<>
			<View style={[styles.wrapper, { paddingTop: insets.top }]}>
				<View style={styles.screenHeader}>
					<TouchableOpacity onPress={() => navigation.navigate("newPlaylist")}>
						<Text style={styles.headerText}>Hello {userData.firstName}</Text>
					</TouchableOpacity>
					<View style={{ marginTop: 20, marginRight: 0 }}>
						<AvatarInitials size={68} />
					</View>
				</View>

				<ScrollView
					style={styles.contentContainer}
					contentContainerStyle={{
						alignItems: "center",
					}}
					showsVerticalScrollIndicator={false}>
					<View style={styles.header}>
						<Text style={styles.headerShortcuts}>Rubriques</Text>
					</View>
					<ScrollView
						style={styles.shortcutsContainer}
						horizontal={true}
						showsHorizontalScrollIndicator={false}>
						<View style={styles.shortcuts}>
							{/* Les Le Jeu Card */}
							<View style={{ alignItems: "center" }}>
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
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Le Jeu
									</Text>
									<Text style={{ fontSize: FontSize10 }}>Vrai ou faux ?</Text>
								</View>
							</View>

							{/* Les Les Stats Card */}
							<View style={{ alignItems: "center" }}>
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
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Mes Stats
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Résultats, classement
									</Text>
								</View>
							</View>

							{/* Les Dico Card */}
							<View style={{ alignItems: "center" }}>
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
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Dico
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Déchiffrer le jargon
									</Text>
								</View>
							</View>

							{/* Les Playlists Card */}
							<View style={{ alignItems: "center" }}>
								<TouchableOpacity
									style={styles.cardsButton}
									onPress={() => navigation.navigate("playlists")}>
									<View style={styles.imageContainer}>
										<Image
											source={playlists}
											style={styles.shortcutsCards}
											resizeMode='contain'
										/>
									</View>
								</TouchableOpacity>
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Mes playlists
									</Text>
									<Text style={{ fontSize: FontSize10 }}>Mes favoris</Text>
								</View>
							</View>

							{/* Les Metiers Card */}
							<View>
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
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Les métiers de la com'
									</Text>
									<Text style={{ fontSize: FontSize10 }}>Trouver sa voie</Text>
								</View>
							</View>

							{/* Le Feed Card */}
							<View>
								<TouchableOpacity
									style={styles.cardsButton}
									onPress={() => navigation.navigate("feed")}>
									<View style={styles.imageContainer}>
										<Image
											source={feed}
											style={styles.shortcutsCards}
											resizeMode='contain'
										/>
									</View>
								</TouchableOpacity>
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Le feed
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Pour ne rien louper
									</Text>
								</View>
							</View>

							{/* Feedback Card */}
							{/* <View>
								<TouchableOpacity
									style={styles.cardsButton}
									onPress={() => navigation.navigate("feedback")}>
									<View style={styles.imageContainer}>
										<Image
											source={feedback}
											style={styles.shortcutsCards}
											resizeMode='contain'
										/>
									</View>
								</TouchableOpacity>
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Feedback
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Votre voix compte
									</Text>
								</View>
							</View> */}
						</View>
					</ScrollView>

					{/* Second row of shortcuts */}
					<ScrollView
						style={[styles.shortcutsContainer, { marginTop: -20 }]}
						horizontal={true}
						showsHorizontalScrollIndicator={false}>
						<View style={styles.shortcuts}>
							{/* Les 10 Commandements Card */}
							<View style={{ alignItems: "center" }}>
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
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										10 commandements
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Les recettes en pagaille
									</Text>
								</View>
							</View>

							{/* Les Petits Card */}
							<View>
								<TouchableOpacity
									style={styles.cardsButton}
									onPress={() => navigation.navigate("petitesHistoires")}>
									<View style={styles.imageContainer}>
										<Image
											source={histoires}
											style={styles.shortcutsCards}
											resizeMode='contain'
										/>
									</View>
								</TouchableOpacity>
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										La petites histoires
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Apprendre en regardant
									</Text>
								</View>
							</View>

							{/* Les Citations Card */}
							<View style={{ alignItems: "center" }}>
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
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Les citations
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										S'inspirer tous les jours
									</Text>
								</View>
							</View>

							{/* Les 3 Secrets Card */}
							<View style={{ alignItems: "center" }}>
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
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										3 secrets du succès
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Les clés de la réussite
									</Text>
								</View>
							</View>

							{/* 3à Secondes Chrono */}
							<View>
								<TouchableOpacity style={styles.cardsButton}>
									<View style={styles.imageContainer}>
										<Image
											source={trentes}
											style={styles.shortcutsCards}
											resizeMode='contain'
										/>
									</View>
								</TouchableOpacity>
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										30s top chrono
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Decryptage de pubs
									</Text>
								</View>
							</View>

							{/* Les Flops Card */}
							<View>
								<TouchableOpacity style={styles.cardsButton}>
									<View style={styles.imageContainer}>
										<Image
											source={homeActusDis}
											style={styles.shortcutsCards}
											resizeMode='contain'
										/>
									</View>
								</TouchableOpacity>
								<View
									style={{
										alignItems: "center",
										marginLeft: -20,
									}}>
									<Text style={{ fontSize: FontSize12, fontWeight: "bold" }}>
										Top des flips
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Petits et grands échecs
									</Text>
								</View>
							</View>
						</View>
					</ScrollView>

					<View style={styles.header}>
						<Text style={styles.headerShortcuts}>A la une</Text>
					</View>
					<View style={styles.alLaUneContainer}>
						<View style={styles.alLaUne}>
							<ALaUneCitation />
							<ALaUneDico />
						</View>
					</View>
				</ScrollView>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
		paddingBottom: 20,
	},
	screenHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
		paddingHorizontal: 20,
	},
	header: {
		minWidth: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
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
		paddingTop: 30,
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
		alignItems: "center",
	},
	shortcutsCards: {
		alignItems: "flex-end",
		width: "100%",
		height: "100%",
	},
});

export default HomeScreen;
