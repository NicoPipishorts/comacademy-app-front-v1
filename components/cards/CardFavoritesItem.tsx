import { colorBlack, colorWhite } from "@/constants/colors";
import { truncateString } from "@/helpers/truncateText";
import { QuestionAttributes } from "@/types/question";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	data: QuestionAttributes;
	categoriesColors: { [key: number]: string };
	categoriesIcons: { [key: number]: string };
}

export default function CardFavoritesItem({
	data,
	categoriesColors,
	categoriesIcons,
}: Props) {
	const elementCats = () => {
		return data.CATEGORIE.split(",");
	};

	return (
		<View style={styles.wrapper}>
			<View style={styles.cardContainer}>
				<View style={styles.cardIcons}>
					{elementCats().map((cat, index) => {
						return (
							<Image
								key={index}
								style={[
									styles.icon,
									{ backgroundColor: `#${categoriesColors[cat]}` },
								]}
								source={{
									uri: `${process.env.EXPO_PUBLIC_URL}${categoriesIcons[cat]}`,
								}}
							/>
						);
					})}
				</View>
				<View style={styles.cardRowContent}>
					<View style={{ flexShrink: 1 }}>
						<Text>{truncateString(data.QUESTION, 70)}</Text>
					</View>
					<TouchableOpacity style={styles.button}>
						<Text style={{ color: colorWhite }}>Voir</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colorWhite,
		borderRadius: 15,
		marginBottom: 15,
		overflow: "hidden",
	},
	cardContainer: {
		flexDirection: "column",
		justifyContent: "space-between",
		padding: 15,
	},
	cardIcons: {
		flexDirection: "row",
		justifyContent: "flex-start",
		paddingRight: 10,
		paddingBottom: 10,
	},
	icon: {
		marginRight: 5,
		width: 24,
		height: 24,
		borderRadius: 50,
		resizeMode: "contain",
	},
	cardRowContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	categoriesContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		minWidth: 60,
	},
	button: {
		justifyContent: "center",
		marginLeft: 20,
		backgroundColor: colorBlack,
		paddingHorizontal: 15,
		paddingVertical: 4,
		borderRadius: 50,
	},
});
