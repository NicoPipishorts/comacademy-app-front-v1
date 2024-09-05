import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeH1 } from "@/constants/fontsizes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// Assets
import { CategorieColors } from "@/types/categories";
import { GameData } from "@/types/game";
import Loader from "../experience/loader";

interface CardProps {
	data: GameData;
	catColors: CategorieColors;
	onSwipeLeft: (cardIndex: number) => void;
	onSwipeRight: (cardIndex: number) => void;
	cardIndex: number;
}

const Card = ({ data, catColors, cardIndex }: CardProps) => {
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
		<View style={styles.cardsWrapper}>
			<View
				style={[
					{
						backgroundColor: `${backGroundColor()}`,
					},
					styles.cardContainer,
				]}>
				<View style={styles.containerTopRow}>
					<View style={styles.containerStars}>
						{Array.from({ length: data.attributes.COEF }, (_, index) => (
							<MaterialCommunityIcons
								key={index}
								name='star-outline'
								size={30}
								color={colorWhite}
								style={styles.iconStars}
							/>
						))}
					</View>
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
				{
					// TODO Works on buttons for swiping
				}
				{/* <View style={styles.containerCardIcons}>
					<TouchableOpacity onPress={() => onSwipeLeft(cardIndex)}>
						<MaterialCommunityIcons
							name='thumb-down-outline'
							size={30}
							color={colorWhite}
							style={styles.cardIcon}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={testPress}>
						<MaterialCommunityIcons
							name='thumb-up-outline'
							size={30}
							color={colorWhite}
							style={styles.cardIcon}
						/>
					</TouchableOpacity>
				</View> */}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	cardsWrapper: {
		paddingTop: "25%",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	cardContainer: {
		minHeight: "65%",
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
		elevation: 5, // Elevation for Android shadow
	},
	containerTopRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	containerStars: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 20,
	},
	iconStars: {
		paddingRight: 2,
	},
	containerCatIcon: {
		paddingVertical: 10,
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
