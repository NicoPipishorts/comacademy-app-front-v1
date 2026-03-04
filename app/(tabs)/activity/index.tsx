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
import lesCitations from "@/assets/imgs/cards/home_citations.png";
import dico from "@/assets/imgs/cards/home_dico.png";
import feed from "@/assets/imgs/cards/home_feed.png";
import feedback from "@/assets/imgs/cards/home_feedback.png";
import topFlops from "@/assets/imgs/cards/home_flops_dis.png";
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
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HomeScreen = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const { auth } = useAuthSession();
	const { data: userData } = useGetUserInfo(auth?.user.id);

	useTrackPageMetrics({ page: "Dashboard" });

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["Citations"] });
	}, []);

	if (!userData) {
		return <Loader />;
	}

	return (
		<>
			<View style={styles.wrapper}>
				<ScrollView
					style={styles.contentContainer}
					contentContainerStyle={{
						alignItems: "center",
					}}
					showsVerticalScrollIndicator={false}>
					<View
						style={[
							styles.screenHeaderContainer,
							{ paddingTop: insets.top },
						]}>
						<View style={styles.screenHeader}>
							<TouchableOpacity onPress={() => navigation.navigate("newPlaylist")}>
								<Text style={styles.headerText}>Hello {userData.firstName}</Text>
							</TouchableOpacity>
							<View style={{ marginRight: 0 }}>
								<AvatarInitials size={68} />
							</View>
						</View>
					</View>

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
									<Text style={{ fontSize: FontSize10 }}>Focus</Text>
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

							{/* Feedback Card */}
							<View>
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
							</View>
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
										Tips and tactics
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Astuces pour réussir
									</Text>
								</View>
							</View>

							{/* Les Petits Histoires Card */}
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
										La petite histoire...
									</Text>
									<Text style={{ fontSize: FontSize10 }}>
										Anecdotes pour briller
									</Text>
								</View>
							</View>

							{/* Les Citations Card */}
							<View style={{ alignItems: "center" }}>
								<TouchableOpacity
									style={styles.cardsButton}
									onPress={() => navigation.navigate("citations")}>
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
										Bol d’inspiration
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
										Secrets de marques
									</Text>
								</View>
							</View>

							{/* 3à Secondes Chrono */}
							<View>
								<TouchableOpacity
									style={styles.cardsButton}
									onPress={() => navigation.navigate("trenteSecondes")}>
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
										1 pub, 1 analyse, c’est plié
									</Text>
								</View>
							</View>

							{/* Les Flops Card */}
							<View>
								<TouchableOpacity
									style={styles.cardsButton}
									onPress={() => navigation.navigate("topDesFlops")}>
									<View style={styles.imageContainer}>
										<Image
											source={topFlops}
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
										Top des flops
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
	screenHeaderContainer: {
		width: "100%",
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	screenHeader: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingTop: 14,
		paddingBottom: 14,
		borderRadius: 18,
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
		width: "100%",
		paddingHorizontal: 20,
	},
	alLaUne: {
		flexDirection: "column",
		justifyContent: "flex-start",
		width: "100%",
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
