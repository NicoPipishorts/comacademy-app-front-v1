import PlayButton from "@/assets/imgs/BigPlayButton.png";
import { colorWhite } from "@/constants/colors";
import {
	FontSize16,
	FontSize20,
	FontSizeScreenTitles,
} from "@/constants/fontsizes";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	handlePressPlay: () => void;
	selectedTab: boolean;
	setSelectedTab: Dispatch<SetStateAction<boolean>>;
	disabled: boolean;
	filterByCat: number | null;
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
}

export default function LetsPlay({
	handlePressPlay,
	disabled,
	filterByCat,
	setFilterByCat,
}: Props) {
	const { data: dataCategory } = useCategoriesFull();
	const selectedCategory =
		dataCategory?.data?.find(
			(category) => category.attributes.staticId === filterByCat
		) ??
		(filterByCat != null ? dataCategory?.data?.[filterByCat - 1] : undefined);
	const selectedCategoryIconUrl =
		selectedCategory?.attributes?.smallIcon?.data?.attributes?.url;
	const selectedCategoryTitle = selectedCategory?.attributes?.Title;
	const selectedCategoryBackgroundColor =
		selectedCategory?.attributes?.backgroundColor;

	return (
		<View style={styles.wrapperCenter}>
			{filterByCat && selectedCategory && (
				<View
					style={[
						styles.card,
						{
							backgroundColor: `#${selectedCategoryBackgroundColor}`,
						},
					]}>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={() => setFilterByCat(null)}>
						<MaterialCommunityIcons
							name='close-circle-outline'
							size={24}
							color={colorWhite}
						/>
					</TouchableOpacity>
					<Text style={styles.cardText}>{selectedCategoryTitle}</Text>
					{selectedCategoryIconUrl ? (
						<Image
							source={{
								uri: selectedCategoryIconUrl,
							}}
							style={styles.icon}
						/>
					) : null}
				</View>
			)}
			<View>
				<Text style={styles.centerTitle}>A toi de jouer !</Text>
			</View>
			<View style={styles.playButtonContainer}>
				<TouchableOpacity onPress={handlePressPlay} disabled={!disabled}>
					<Image
						source={PlayButton}
						resizeMode='contain'
						style={styles.playButton}
					/>
				</TouchableOpacity>
				{!disabled && (
					<View style={{ paddingTop: 10 }}>
						<Text style={{ fontWeight: "bold", fontSize: FontSize16 }}>
							Pas de connexion internet.
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	closeButton: {
		position: "absolute",
		top: 8,
		right: 10,
	},
	noInternetText: {
		fontWeight: "bold",
		fontSize: FontSize16,
	},
	noInternetContainer: {
		paddingTop: 10,
	},
	wrapperCenter: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingBottom: 90,
	},
	centerTitle: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		marginBottom: 30,
	},
	playButtonContainer: {
		width: "100%",
		alignItems: "center",
	},
	playButton: {
		width: "60%",
		height: undefined,
		aspectRatio: 1,
	},
	floatingTabbarContainer: {
		backgroundColor: "transparent",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		elevation: 5,
		zIndex: 1,
	},
	card: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "60%",
		aspectRatio: 2 / 1,
		paddingTop: 30,
		marginTop: -70,
		marginBottom: 40,
		borderRadius: 20,
		padding: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 5,
	},
	icon: {
		width: 45,
		height: 45,
	},
	cardText: {
		color: colorWhite,
		fontSize: FontSize20,
		fontWeight: "bold",
		paddingHorizontal: 10,
		flexShrink: 1,
	},
});
