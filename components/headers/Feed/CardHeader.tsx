import { colorDarkGrey, colorGrey } from "@/constants/colors";
import { FontSize14, FontSizeH3 } from "@/constants/fontsizes";
import { formatTimeElapsed } from "@/helpers/formatTimeElapsed";
import { FeedItem } from "@/types/feed";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const ICONS = {
	secret: require("@/assets/imgs/icons/feed/secret.png"),
	dico: require("@/assets/imgs/icons/feed/dico.png"),
	citation: require("@/assets/imgs/icons/feed/citation.png"),
	metier: require("@/assets/imgs/icons/feed/metier.png"),
	question: require("@/assets/imgs/icons/feed/question.png"),
	commandement: require("@/assets/imgs/icons/feed/commandement.png"),
	chiffre: require("@/assets/imgs/icons/feed/chiffre.png"),
	argh: require("@/assets/imgs/icons/feed/argh.png"),
	image: require("@/assets/imgs/icons/feed/image.png"),
	vie: require("@/assets/imgs/icons/feed/vie.png"),
	cultureCom: require("@/assets/imgs/icons/feed/cultureCom.png"),
	actusBref: require("@/assets/imgs/icons/feed/actusBref.png"),
	lol: require("@/assets/imgs/icons/feed/lol.png"),
	comAcademy: require("@/assets/imgs/icons/feed/comAcademy.png"),
	marqueMystere: require("@/assets/imgs/icons/feed/marqueMystere.png"),
	petitesHistoires: require("@/assets/imgs/icons/feed/petitesHistoires.png"),
};

const TITLES = {
	secret: "3 secrets du succès",
	dico: "Le dico",
	citation: "Les citations",
	metier: "Les métiers de la com",
	question: "Com'Academy : Le jeu",
	commandement: "Les 10 commandements",
	"feed-post-chiffre": "Le chiffre du jour",
	"feed-post-argh": "AARRGHH !! ",
	"feed-post-image": "Une image/ un métier",
	"feed-post-vie": "Vie de com'",
	"feed-post-cultureCom": "Culture Com",
	"feed-post-actusBref": "Actus en bref",
	"feed-post-lol": "LOL",
	"feed-post-comAcademy": "Com'Academy",
	"feed-post-marqueMystere": "Marque mystère",
	"feed-post-petitesHistoires": "La petite histoire \ndes marques ",
};

const SUB_TITLES = {
	secret: "Secrets de marques",
	dico: "Déchiffrer le jargon de la com",
	citation: "Bol d'inspiration",
	metier: "Focus",
	question: "Alors, vrai ou faux?",
	commandement: "Astuces pour réussir",
	"feed-post-argh": "L’expression qui énerve",
	"feed-post-petitesHistoires": "Anecdotes pour briller",
	"feed-post-chiffre": "1 chiffre : 1 révélation",
	"feed-post-vie": "Ca sent le vécu",
	"feed-post-cultureCom": "Culture Com",
	"feed-post-actusBref": "L'actu sans blabla",
	"feed-post-comAcademy": "Le Boss",
	"feed-post-image": "1 image vaut 1000 mots",
	"feed-post-lol": "La pause café",
};

const DESTINATIONS = {
	secret: "secrets",
	dico: "dico",
	citation: "lesCitations",
	metier: "metiers",
	question: "leJeu",
	commandement: "commandements",
};

interface Props {
	data: FeedItem;
}

export default function FeedCardHeader({ data }: Props) {
	const navigation = useNavigation<NavigationType>();

	const typeIcon = useMemo(() => {
		return data.type !== "feed-post"
			? ICONS[data.type]
			: ICONS[data.payload.Type] || null;
	}, [data]);

	const title = useMemo(() => {
		if (data.type === "feed-post") {
			return TITLES[`${data.type}-${data.payload.Type}`] || null;
		}
		return TITLES[data.type];
	}, [data]);

	const subTitle = useMemo(() => {
		if (data.type === "feed-post") {
			return SUB_TITLES[`${data.type}-${data.payload.Type}`] || null;
		}
		return SUB_TITLES[data.type];
	}, [data]);

	const destination = useMemo(() => DESTINATIONS[data.type] || null, [data]);

	const handleNavigation = () => {
		if (destination) navigation.navigate(destination);
	};

	return (
		<View>
			<View style={styles.container}>
				<Image source={typeIcon} style={styles.icon} resizeMode='contain' />
				{data.type !== "feed-post" && (
					<Pressable style={styles.pressable} onPress={handleNavigation}>
						<Image
							source={require("@/assets/imgs/icons/plus-circle.png")}
							style={styles.plusIcon}
							resizeMode='contain'
						/>
					</Pressable>
				)}
				<View style={styles.textContainer}>
					<View style={styles.infoContainer}>
						<Text style={styles.title}>{title}</Text>
						<Text style={styles.time}>{formatTimeElapsed(data.createdAt)}</Text>
					</View>
					{subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "flex-start",
		width: "100%",
	},
	icon: {
		width: 48,
		height: 48,
		marginRight: 10,
	},
	pressable: {
		position: "absolute",
		top: 24,
		left: 24,
		width: 32,
		height: 32,
	},
	plusIcon: {
		width: 32,
		height: 32,
		borderRadius: 15,
		borderWidth: 3,
		borderColor: colorGrey,
	},
	textContainer: {
		flex: 1,
	},
	infoContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingRight: 10,
	},
	title: {
		fontSize: FontSizeH3,
		fontWeight: "bold",
	},
	subTitle: {
		fontSize: FontSize14,
		color: colorDarkGrey,
	},
	time: {
		fontSize: FontSize14,
		fontWeight: "bold",
		color: colorDarkGrey,
	},
});
