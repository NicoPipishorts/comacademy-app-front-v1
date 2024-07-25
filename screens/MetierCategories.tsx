import { CategoriePayload } from "@/types/categories";
import { Dispatch, SetStateAction } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
	colorWhite,
	colorYellow,
	primaryBackground,
} from "../constants/colors";
import { FontSize22 } from "../constants/fontsizes";

type Props = {
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
	dataCategory: CategoriePayload;
};

const MetierCategories = ({ setFilterByCat, dataCategory }: Props) => {
	return (
		<>
			<View style={styles.cardContainer}>
				{dataCategory.data.map((cat) => {
					return (
						<TouchableOpacity
							key={cat.id}
							onPress={() => setFilterByCat(cat.id)}
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
		</>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
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
});

export default MetierCategories;
