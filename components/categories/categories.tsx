import { colorWhite, colorYellow, primaryBackground } from "@/constants/colors";
import { FontSize22 } from "@/constants/fontsizes";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import React, { Dispatch, SetStateAction } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface Props {
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
	setActiveTab: Dispatch<SetStateAction<number>>;
}

const CategoriesCards = ({ setFilterByCat, setActiveTab }: Props) => {
	const { data: dataCategory } = useCategoriesFull();

	const onPress = (filter: number) => {
		setFilterByCat(filter);
		setActiveTab(0);
	};

	return (
		<>
			<ScrollView contentContainerStyle={styles.wrapper}>
				<View style={styles.cardContainer}>
					{dataCategory.data.map((cat) => {
						return (
							<TouchableOpacity
								key={cat.id}
								onPress={() => onPress(cat.id - 6)}
								style={[
									styles.card,
									{ backgroundColor: `#${cat.attributes.backgroundColor}` },
								]}>
								<Image
									source={{
										uri: `${process.env.EXPO_PUBLIC_URL}${cat.attributes.smallIcon.data.attributes.url}`,
									}}
									style={styles.icon}
								/>
								<Text style={styles.cardText}>{cat.attributes.Title}</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			</ScrollView>
		</>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "flex-start",
		backgroundColor: primaryBackground,
	},
	cardContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	card: {
		backgroundColor: colorYellow,
		width: "47%",
		minHeight: 150,
		marginVertical: 10,
		alignItems: "flex-start",
		justifyContent: "flex-start",
		borderRadius: 10,
		padding: 5,
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
		width: 55,
		height: 55,
		marginBottom: 15,
	},
	cardText: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
		paddingHorizontal: 10,
	},
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 120, // Adjust this value based on your design
		justifyContent: "center",
		alignItems: "center",
	},
});

export default CategoriesCards;
