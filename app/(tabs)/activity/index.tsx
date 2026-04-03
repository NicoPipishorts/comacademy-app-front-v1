import React, { useEffect } from "react";
import {
	Image,
	ImageSourcePropType,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Custom images and constants
import bonduShortcutCard from "@/assets/imgs/cards/shortcutCards/Bonus.png";
import feedbackShortcutCard from "@/assets/imgs/cards/shortcutCards/Feedbacks.png";
import mesStatsShortcutCard from "@/assets/imgs/cards/shortcutCards/Mes stats.png";
import parcoursShortcutCard from "@/assets/imgs/cards/shortcutCards/parcours.png";
import playlistsShortcutCard from "@/assets/imgs/cards/shortcutCards/Playlists.png";
import secretsCard from "@/assets/imgs/cards/v2/3 secrets card.svg";
import trenteSecondesCard from "@/assets/imgs/cards/v2/30s card.svg";
import citationsCard from "@/assets/imgs/cards/v2/Citations card.svg";
import dicoCard from "@/assets/imgs/cards/v2/Dico card.svg";
import feedCard from "@/assets/imgs/cards/v2/Feed card.svg";
import jouerCard from "@/assets/imgs/cards/v2/Jouer card.svg";
import metiersCard from "@/assets/imgs/cards/v2/Metiers card.svg";
import tipsCard from "@/assets/imgs/cards/v2/Tips card.svg";
import topDesFlopsCard from "@/assets/imgs/cards/v2/Top des flops.svg";
import { primaryBackground } from "@/constants/colors";
import { FontSizeH1, FontSizeScreenTitles } from "@/constants/fontsizes";

// Components and hooks
import ALaUneCitation from "@/components/ALaUneCitation";
import ALaUneDico from "@/components/ALaUneDico";
import Loader from "@/components/experience/loader";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import { NavigationType } from "@/types/general";
import { Asset } from "expo-asset";
import { useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

type RubriqueCard = {
	id: string;
	source: any;
	route: string;
};

type ShortcutCard = {
	id: string;
	source: ImageSourcePropType;
	route: string;
};

const SHORTCUT_CARD_WIDTH = 140;
const SHORTCUT_CARD_ASPECT_RATIO = 255 / 200;

const rubriquesCards: RubriqueCard[] = [
	{ id: "jouer", source: jouerCard, route: "leJeu" },
	{ id: "tips", source: tipsCard, route: "commandements" },
	{ id: "dico", source: dicoCard, route: "dico" },
	{
		id: "trente-secondes",
		source: trenteSecondesCard,
		route: "trenteSecondes",
	},
	{ id: "secrets", source: secretsCard, route: "secrets" },
	{ id: "top-des-flops", source: topDesFlopsCard, route: "topDesFlops" },
	{ id: "citations", source: citationsCard, route: "citations" },
	{ id: "metiers", source: metiersCard, route: "metiers" },
	{ id: "feed", source: feedCard, route: "feed" },
];

const shortcutCards: ShortcutCard[] = [
	{ id: "mes-stats", source: mesStatsShortcutCard, route: "/user/myStats" },
	{ id: "playlists", source: playlistsShortcutCard, route: "/playlists" },
	{ id: "parcours", source: parcoursShortcutCard, route: "/parcours" },
	{ id: "bonus", source: bonduShortcutCard, route: "/bonus" },
	{ id: "feedback", source: feedbackShortcutCard, route: "/feedback" },
];

const SvgCard = ({ source }: { source: any }) => {
	const cardUri = Asset.fromModule(source).uri;
	return <SvgUri uri={cardUri} width='100%' height='100%' />;
};

const HomeScreen = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const router = useRouter();
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
					<PageTitleAvatarHeader
						title={`Hello ${userData.firstName}`}
						onPressTitle={() => navigation.navigate("newPlaylist")}
						containerStyle={[
							styles.screenHeaderContainer,
							{ paddingTop: insets.top },
						]}
						contentStyle={styles.screenHeader}
						titleStyle={styles.headerText}
					/>

					<View style={styles.header}>
						<Text style={styles.headerShortcuts}>Les Rubriques</Text>
					</View>
					<ScrollView
						style={styles.rubriquesContainer}
						horizontal={true}
						showsHorizontalScrollIndicator={false}>
						<View style={styles.rubriquesRow}>
							{rubriquesCards.map((card) => (
								<TouchableOpacity
									key={card.id}
									style={styles.rubriqueCardButton}
									activeOpacity={0.9}
									onPress={() => navigation.navigate(card.route)}>
									<SvgCard source={card.source} />
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>

					<View style={styles.header}>
						<Text style={styles.headerShortcuts}>Aujourd'hui</Text>
					</View>
					<View style={styles.alLaUneContainer}>
						<View style={styles.alLaUne}>
							<ALaUneCitation />
							<ALaUneDico />
						</View>
					</View>

					<View style={styles.header}>
						<Text style={styles.headerShortcuts}>Raccourcis</Text>
					</View>
					<ScrollView
						style={styles.shortcutCardsContainer}
						horizontal
						showsHorizontalScrollIndicator={false}>
						<View style={styles.shortcutCardsRow}>
							{shortcutCards.map((card) => (
								<TouchableOpacity
									key={card.id}
									style={styles.shortcutCardButton}
									activeOpacity={0.9}
									onPress={() => router.push(card.route as any)}>
									<Image
										source={card.source}
										style={styles.shortcutCardImage}
										resizeMode='contain'
									/>
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>
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
		paddingHorizontal: 12,
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
		paddingVertical: 20,
	},
	headerText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	profileImage: {
		width: 90,
		height: 90,
		marginRight: 10,
	},
	contentContainer: {
		flex: 1,
		marginBottom: 60,
	},
	headerShortcuts: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
	},
	shortcutsContainer: {
		flexGrow: 0,
		paddingHorizontal: 20,
	},
	shortcutCardsContainer: {
		flexGrow: 0,
		width: "100%",
		marginBottom: 64,
		paddingVertical: 40,
		paddingHorizontal: 20,
		marginTop: -40,
	},
	shortcutCardsRow: {
		flexDirection: "row",
		justifyContent: "flex-start",
		paddingRight: 20,
		gap: 18,
	},
	rubriquesContainer: {
		flexGrow: 0,
		width: "100%",
		paddingLeft: 20,
		marginBottom: 30,
	},
	rubriquesRow: {
		flexDirection: "row",
		justifyContent: "flex-start",
		paddingRight: 20,
		marginBottom: 24,
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
	rubriqueCardButton: {
		width: 120,
		height: 230,
		borderRadius: 11,
		overflow: "hidden",
		marginRight: 12,
	},
	shortcutCardButton: {
		width: SHORTCUT_CARD_WIDTH,
		aspectRatio: SHORTCUT_CARD_ASPECT_RATIO,
		borderRadius: 18,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.18,
		shadowRadius: 15,
		elevation: 12,
	},
	shortcutCardImage: {
		width: "100%",
		height: "100%",
		borderRadius: 18,
	},
});

export default HomeScreen;
