import Loader from "@/components/experience/loader";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeH3 } from "@/constants/fontsizes";
import { truncateString } from "@/helpers/truncateText";
import { DicoFavoritesWord } from "@/types/dico";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	data: DicoFavoritesWord;
	categoriesColors: { [key: number]: string };
	categoriesIcons: { [key: number]: string };
}

export default function CardFavoriteMetier({
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
					navigation.navigate("favoriteDicoDetails", {
						dicoId: data.id,
					});
				}}>
				<View style={styles.cardContainer}>
					<View style={styles.cardIcons}>
						{data.attributes.Categories?.split(",").map((cat, index) => {
							if (cat) {
								return (
									<Image
										key={index}
										style={[
											styles.icon,
											{ backgroundColor: `${categoriesColors}` },
										]}
										source={{
											uri: `${process.env.EXPO_PUBLIC_URL}${categoriesIcons}`,
										}}
									/>
								);
							} else return null;
						})}
					</View>
					<View style={styles.cardRowContent}>
						<View style={{ flexShrink: 1 }}>
							<Text style={{ fontSize: FontSizeH3, fontWeight: "bold" }}>
								{truncateString(data.attributes.Word, 70)}
							</Text>
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
