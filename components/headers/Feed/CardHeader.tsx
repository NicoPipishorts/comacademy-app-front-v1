import { colorDarkGrey, colorGrey } from "@/constants/colors";
import { FontSize14, FontSizeH3 } from "@/constants/fontsizes";
import { formatTimeElapsed } from "@/helpers/formatTimeElapsed";
import { FeedItem } from "@/types/feed";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedItem;
}

export default function FeedCardHeader({ data }: Props) {
	const navigation = useNavigation<NavigationType>();

	const icons: { [key: string]: any } = {
		secret: require("@/assets/imgs/icons/feed/secret.png"),
		dico: require("@/assets/imgs/icons/feed/dico.png"),
		citation: require("@/assets/imgs/icons/feed/citation.png"),
		metier: require("@/assets/imgs/icons/feed/metier.png"),
		question: require("@/assets/imgs/icons/feed/question.png"),
		commandement: require("@/assets/imgs/icons/feed/commandement.png"),
		chiffre: require("@/assets/imgs/icons/feed/chiffre.png"),
	};

	const typeIcons = () => {
		if (data.type !== "feed-post") {
			return icons[data.type];
		} else {
			switch (data.payload.Icon.split(".")[0]) {
				case "chiffre":
					return icons["chiffre"];
			}
		}
	};

	const typeTitre = () => {
		switch (data.type) {
			case "secret":
				return "3 secrets du succès";
			case "dico":
				return "Le dico";
			case "citation":
				return "Les citations";
			case "metier":
				return "Ton future metier?";
			case "question":
				return "Com'Academy : Le Jeu";
			case "commandement":
				return "Les 10 commandements";
			case "feed-post":
				switch (data.payload.Icon.split(".")[0]) {
					case "chiffre":
						return "Le chiffre du jour";
					default:
						return null;
				}
		}
	};

	const destination = () => {
		switch (data.type) {
			case "secret":
				return "secrets";
			case "dico":
				return "dico";
			case "citation":
				return "lesCitations";
			case "metier":
				return "metiers";
			case "question":
				return "leJeu";
			case "commandement":
				return "commandements";
			default:
				return null;
		}
	};

	return (
		<View>
			<View style={styles.container}>
				<Image source={typeIcons()} style={styles.icon} resizeMode='contain' />
				<Pressable
					style={styles.pressable}
					onPress={() => navigation.navigate(destination())}>
					<Image
						source={require("@/assets/imgs/icons/plus-circle.png")}
						style={styles.plusIcon}
						resizeMode='contain'
					/>
				</Pressable>
				<View style={styles.infoContainer}>
					<Text style={styles.title}>{typeTitre()}</Text>
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
