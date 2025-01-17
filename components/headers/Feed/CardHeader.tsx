import { colorDarkGrey, colorGrey } from "@/constants/colors";
import { FontSize14, FontSizeH3 } from "@/constants/fontsizes";
import { formatTimeElapsed } from "@/helpers/formatTimeElapsed";
import { FeedItem } from "@/types/feed";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const icons = {
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
};

const titles = {
	secret: "3 secrets du succès",
	dico: "Le dico",
	citation: "Les citations",
	metier: "Ton future metier?",
	question: "Com'Academy : Le Jeu",
	commandement: "Les 10 commandements",
	"feed-post-chiffre": "Le chiffre du jour",
	"feed-post-argh": "AARRGHH !! \nL’expression qui énerve",
	"feed-post-image": "Une image/ un métier",
	"feed-post-vie": "Vie de com'",
};

const destinations = {
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
		if (data.type !== "feed-post") {
			return icons[data.type];
		} else {
			return icons[data.payload.Type] || null;
		}
	}, [data]);

	const title = useMemo(() => {
		if (data.type === "feed-post") {
			const postKey = `${data.type}-${data.payload.Type}`;
			return titles[postKey] || null;
		}
		return titles[data.type];
	}, [data]);

	const destination = useMemo(() => destinations[data.type] || null, [data]);

	return (
		<View>
			<View style={styles.container}>
				<Image source={typeIcon} style={styles.icon} resizeMode='contain' />
				{data.type !== "feed-post" && (
					<Pressable
						style={styles.pressable}
						onPress={() => navigation.navigate(destination || "")}>
						<Image
							source={require("@/assets/imgs/icons/plus-circle.png")}
							style={styles.plusIcon}
							resizeMode='contain'
						/>
					</Pressable>
				)}
				<View style={styles.infoContainer}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.time}>{formatTimeElapsed(data.createdAt)}</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "flex-start",
		minWidth: "100%",
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
	infoContainer: {
		flexGrow: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingRight: 10,
		paddingTop: 3,
	},
	title: {
		fontSize: FontSizeH3,
		fontWeight: "bold",
	},
	time: {
		fontSize: FontSize14,
		fontWeight: "bold",
		color: colorDarkGrey,
	},
});
