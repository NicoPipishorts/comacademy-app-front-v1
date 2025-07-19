// File: src/components/leJeu/Card.tsx
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize22 } from "@/constants/fontsizes";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Assets
import jeuIconFalse from "@/assets/imgs/icons/jeu_icon_false.png";
import jeuIconTrue from "@/assets/imgs/icons/jeu_icon_true.png";
import Star from "@/assets/imgs/icons/jeu_star.png";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { CategorieColors } from "@/types/categories";
import { QuestionData } from "@/types/userGameSessionStatus";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Loader from "../experience/loader";

interface CardProps {
	data: QuestionData;
	catColors: CategorieColors;
	onSwipeFalse: () => void;
	onSwipeTrue: () => void;
}

const Card = ({ data, catColors, onSwipeFalse, onSwipeTrue }: CardProps) => {
	const { isHomeButtonModel } = useDeviceTypeCheckers();
	const insets = useSafeAreaInsets();

	if (!data || !catColors?.data?.length) {
		return <Loader />;
	}

	const selectedCategory = data.attributes.CATEGORIE - 1;
	const backGroundColor = `#${catColors.data[selectedCategory].attributes.backgroundColor}`;
	const smallIconUrl =
		catColors.data[selectedCategory].attributes.smallIcon.data.attributes.url;

	const renderStars = () => {
		const stars = [];
		const coef = data.attributes.COEF;
		for (let i = 0; i < Math.min(coef, 3); i++) {
			stars.push(<Image key={i} source={Star} style={styles.starIcon} />);
		}
		return stars;
	};

	return (
		<View style={[styles.cardsWrapper, { paddingTop: insets.top }]}>
			<View
				style={[
					styles.cardContainer,
					{
						backgroundColor: backGroundColor,
						minHeight: isHomeButtonModel ? "85%" : "65%",
					},
				]}>
				<View style={styles.containerTopRow}>
					<View style={styles.containerCatIcon}>{renderStars()}</View>
					<View style={styles.containerCatIcon}>
						<Image
							source={{ uri: `${process.env.EXPO_PUBLIC_URL}${smallIconUrl}` }}
							style={styles.catIcon}
						/>
					</View>
				</View>

				<View style={styles.containerText}>
					<Text style={styles.textText}>{data.attributes.QUESTION}</Text>
				</View>

				<View style={styles.containerCardIcons}>
					<TouchableOpacity onPress={onSwipeFalse} style={styles.cardIcon}>
						<Image source={jeuIconFalse} style={styles.actionIcon} />
					</TouchableOpacity>

					<TouchableOpacity onPress={onSwipeTrue} style={styles.cardIcon}>
						<Image source={jeuIconTrue} style={styles.actionIcon} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	cardsWrapper: {
		justifyContent: "flex-start",
		alignItems: "flex-start",
	},
	cardContainer: {
		width: "100%",
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
		flexDirection: "row",
		paddingVertical: 15,
	},
	catIcon: {
		width: 55,
		height: 55,
	},
	starIcon: {
		width: 45,
		height: 45,
	},
	containerText: {
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
		marginVertical: 20,
	},
	textText: {
		fontSize: FontSize22,
		color: colorWhite,
		fontWeight: "bold",
	},
	containerCardIcons: {
		width: "100%",
		position: "absolute",
		bottom: 30,
		paddingHorizontal: 10,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	cardIcon: {
		padding: 10,
		width: 52,
		height: 52,
		justifyContent: "center",
		alignItems: "center",
	},
	actionIcon: {
		width: 52,
		height: 52,
		resizeMode: "contain",
	},
});

export default Card;
