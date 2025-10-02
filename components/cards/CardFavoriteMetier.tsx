import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeH3 } from "@/constants/fontsizes";
import { truncateString } from "@/helpers/truncateText";
import { NavigationType } from "@/types/general";
import { FavoriteMetier } from "@/types/metiers";
import { useNavigation } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Loader from "../experience/loader";

interface Props {
	data: FavoriteMetier;
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
									uri: `${process.env.EXPO_PUBLIC_URL}/${categoriesIcons}`,
								}}
							/>
						);
					})}
				</View>
				<View style={styles.cardRowContent}>
					<View style={{ flexShrink: 1 }}>
						<Text style={{ fontSize: FontSizeH3, fontWeight: "bold" }}>
							{truncateString(data.attributes.METIER, 70)}
						</Text>
					</View>
					<TouchableOpacity
						style={styles.button}
						onPress={() => {
							navigation.navigate("favoriteMetierDetails", {
								metierId: data.id,
							});
						}}>
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
