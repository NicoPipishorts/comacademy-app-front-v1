import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeH1 } from "@/constants/fontsizes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Assets
import { CategorieColors } from "@/types/categories";
import { GameData } from "@/types/game";

interface CardProps {
	data: GameData;
	catColors: CategorieColors;
	onSwipeLeft: () => void;
	onSwipeRight: () => void;
}

const Card = ({ onSwipeLeft, onSwipeRight, data, catColors }: CardProps) => {
	const [firstElement, setFirstElement] = useState<number>(0);

	useEffect(() => {
		const categorieStr: string = data.attributes.CATEGORIE || "";
		const categories: string[] = categorieStr
			.split(",")
			.map((cat) => cat.trim());
		const selectedCategory: number =
			categories.length > 0
				? parseInt(
						categories[Math.floor(Math.random() * categories.length)] || "0"
				  )
				: 0;
		setFirstElement(selectedCategory);
	}, [data]);

	const testPress = () => {
		onSwipeRight();
	};

	if (!catColors || !catColors.data[firstElement]) return null;

	return (
		<View style={styles.cardsWrapper}>
			<View
				style={[
					{
						backgroundColor: `#${catColors.data[firstElement].attributes.backgroundColor}`,
					},
					styles.cardContainer,
				]}>
				<View style={styles.containerTopRow}>
					<View style={styles.containerStars}>
						<MaterialCommunityIcons
							name='star-outline'
							size={30}
							color={colorWhite}
							style={styles.iconStars}
						/>
						<MaterialCommunityIcons
							name='star-outline'
							size={30}
							color={colorWhite}
							style={styles.iconStars}
						/>
						<MaterialCommunityIcons
							name='star-outline'
							size={30}
							color={colorWhite}
							style={styles.iconStars}
						/>
					</View>
					<View style={styles.containerCatIcon}>
						<Image
							source={{
								uri: `${process.env.EXPO_PUBLIC_URL}${catColors.data[firstElement].attributes.smallIcon.data.attributes.url}`,
							}}
							style={styles.catIcon}></Image>
					</View>
				</View>
				<View style={styles.containerText}>
					<Text style={styles.textText}>{data.attributes.QUESTION}</Text>
				</View>
				<View style={styles.containerCardIcons}>
					<TouchableOpacity onPress={onSwipeLeft}>
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
				</View>
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
		minHeight: "55%",
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
		marginBottom: 80,
	},
	containerCardIcons: {
		width: "100%",
		position: "absolute",
		bottom: 20,
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
