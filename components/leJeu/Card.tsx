import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeH1 } from "@/constants/fontsizes";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// Assets
import Star from "@/assets/imgs/icons/jeu_star.png";
import { default as useDeviceTypeCheckers } from "@/helpers/deviceModel";
import { CategorieColors } from "@/types/categories";
import { GameSessionQuestionData } from "@/types/game";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Loader from "../experience/loader";

interface CardProps {
	data: GameSessionQuestionData;
	catColors: CategorieColors;
}

const Card = ({ data, catColors }: CardProps) => {
	const { isHomeButtonModel } = useDeviceTypeCheckers();
	const insets = useSafeAreaInsets();

	if (!data || !catColors || !catColors.data || catColors.data.length === 0) {
		return <Loader />;
	}

	const selectedCategory: number = data?.attributes.CATEGORIE - 1;

	const backGroundColor = () => {
		return `#${catColors.data[selectedCategory]?.attributes.backgroundColor}`;
	};

	const smallIcon = () => {
		return catColors.data[selectedCategory]?.attributes.smallIcon.data
			.attributes.url;
	};

	const renderStars = () => {
		const stars = [];
		const coef = data?.attributes?.COEF;

		for (let i = 0; i < Math.min(coef, 3); i++) {
			stars.push(<Image key={i} source={Star} style={styles.starIcon} />);
		}

		return stars;
	};

	return (
		<View style={[styles.cardsWrapper, { paddingTop: insets.top }]}>
			<View
				style={[
					{
						backgroundColor: `${backGroundColor()}`,
						minHeight: isHomeButtonModel ? "85%" : "65%",
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
					<Text style={styles.textText}>{data?.attributes.QUESTION}</Text>
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
		minWidth: "100%",
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
		width: 55,
		height: 55,
	},
	starIcon: {
		width: 45,
		height: 45,
	},
	containerText: {},
	textText: {
		fontSize: FontSizeH1,
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
});

export default Card;
