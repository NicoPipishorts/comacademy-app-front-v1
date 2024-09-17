import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeH1 } from "@/constants/fontsizes";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// Assets
import { CategorieColors } from "@/types/categories";
import { GameData } from "@/types/game";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Loader from "../experience/loader";

interface CardProps {
	data: GameData;
	catColors: CategorieColors;
}

const Card = ({ data, catColors }: CardProps) => {
	const insets = useSafeAreaInsets();
	if (!data || !catColors || !catColors.data || catColors.data.length === 0) {
		return <Loader />;
	}
	const selectedCategory: number = data?.attributes.CATEGORIE;
	const backGroundColor = () => {
		const colorItem = catColors.data.find(
			(color) => color.id === selectedCategory[0]
		);
		return `#${colorItem?.attributes.backgroundColor}`;
	};

	return (
		<View style={[styles.cardsWrapper, { paddingTop: insets.top }]}>
			<View
				style={[
					{
						backgroundColor: `${backGroundColor()}`,
					},
					styles.cardContainer,
				]}>
				<View style={styles.containerTopRow}>
					<View style={styles.containerCatIcon}>
						<Image
							source={{
								uri: `${process.env.EXPO_PUBLIC_URL}${
									catColors.data[selectedCategory[0] - 1].attributes.smallIcon
										.data.attributes.url
								}`,
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
		// paddingTop: "15%",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	cardContainer: {
		minHeight: "75%",
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
		justifyContent: "flex-end",
	},
	containerCatIcon: {
		paddingVertical: 15,
	},
	catIcon: {
		width: 55,
		height: 55,
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
