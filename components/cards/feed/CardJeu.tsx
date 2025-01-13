import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize14, FontSizeH3 } from "@/constants/fontsizes";
import useCategories from "@/hooks/useCategories";
import { FeedAttributes } from "@/types/feed";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedAttributes;
}

export default function FeedCardJeu({ data }: Props) {
	const { data: categories, isFetched } = useCategories();
	const navigation = useNavigation<NavigationType>();

	if (!isFetched) {
		return null;
	}

	const backGroundColor = () => {
		return `#${
			categories.data[data.payload.CATEGORIE - 1]?.attributes.backgroundColor
		}`;
	};

	const smallIcon = () => {
		return categories.data[data.payload.CATEGORIE - 1]?.attributes.smallIcon
			.data.attributes.url;
	};

	const renderStars = () => {
		const stars = [];
		const coef = data.payload.COEF;

		for (let i = 0; i < Math.min(coef, 3); i++) {
			stars.push(
				<Image
					key={i}
					source={require("@/assets/imgs/icons/jeu_star.png")}
					style={styles.starIcon}
				/>
			);
		}

		return stars;
	};

	return (
		<View style={styles.cardWrapper}>
			<Text style={styles.textTitle}>Alors, vrai ou faux ?</Text>

			<View
				style={[
					{
						backgroundColor: `${backGroundColor()}`,
					},
					styles.cardContainer,
				]}>
				<View style={styles.containerTopRow}>
					<View style={styles.containerCatIcon}>{renderStars()}</View>
					<View style={styles.containerCatIcon}>
						<Image
							source={{
								uri: `${process.env.EXPO_PUBLIC_URL}${smallIcon()}`,
							}}
							style={styles.catIcon}
						/>
					</View>
				</View>
				<View style={styles.containerText}>
					<Text style={styles.textText}>{data.payload.QUESTION}</Text>
				</View>
			</View>

			<View style={styles.buttonContainer}>
				<Pressable
					style={styles.button}
					onPress={() => navigation.navigate("leJeu")}>
					<Text style={{ color: colorWhite, fontWeight: "bold" }}>Jouer</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		marginLeft: 10,
		width: "84%",
	},
	textTitle: {
		color: colorBlack,
		fontSize: FontSizeH3,
		fontWeight: "bold",
		marginBottom: 15,
	},

	cardContainer: {
		minWidth: "100%",
		minHeight: 200,
		padding: 20,
		paddingTop: 0,
		borderRadius: 25,
		justifyContent: "flex-start",
		alignItems: "center",
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	containerTopRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	containerCatIcon: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		paddingVertical: 15,
	},
	catIcon: {
		width: 30,
		height: 30,
	},
	starIcon: {
		width: 28,
		height: 28,
	},
	containerText: {},
	textText: {
		fontSize: FontSize14,
		color: colorWhite,
		fontWeight: "bold",
	},
	containerCardIcons: {
		width: "100%",
		position: "absolute",
		bottom: 20,
		marginTop: 80,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	cardIcon: {
		padding: 10,
		borderColor: colorWhite,
		borderWidth: 4,
		borderRadius: 30,
		width: 60,
		height: 60,
		justifyContent: "center",
		alignItems: "center",
	},

	buttonContainer: {
		alignItems: "center",
		marginTop: 20,
	},

	button: {
		backgroundColor: colorBlack,
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 50,
	},
});
