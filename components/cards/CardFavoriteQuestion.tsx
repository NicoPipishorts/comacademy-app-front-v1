import { colorBlack, colorWhite } from "@/constants/colors";
import { truncateString } from "@/helpers/truncateText";
import { NavigationType } from "@/types/general";
import { QuestionSolo } from "@/types/question";
import { useNavigation } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Loader from "../experience/loader";

interface Props {
	data: QuestionSolo;
	categoriesColors: { [key: number]: string };
	categoriesIcons: { [key: number]: string };
}

export default function CardFavoriteQuestion({
	data,
	categoriesColors,
	categoriesIcons,
}: Props) {
	const navigation = useNavigation<NavigationType>();

	if (!data) {
		return <Loader />;
	}

	return (
		<View style={styles.wrapper}>
			<TouchableOpacity
				onPress={() => {
					navigation.navigate("favoriteQuestionDetails", {
						questionId: data.id,
					});
				}}>
				<View style={styles.cardContainer}>
					<View style={styles.cardIcons}>
						{data.attributes.CATEGORIE?.split(",").map((cat, index) => {
							return (
								<Image
									key={index}
									style={[
										styles.icon,
										{ backgroundColor: `${categoriesColors}` },
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
							<Text>{truncateString(data.attributes.QUESTION, 70)}</Text>
						</View>
						<View style={styles.button}>
							<Text style={{ color: colorWhite }}>Voir</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
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
