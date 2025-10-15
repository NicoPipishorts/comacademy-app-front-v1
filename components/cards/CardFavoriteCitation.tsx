import Loader from "@/components/experience/loader";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeH3 } from "@/constants/fontsizes";
import { truncateString } from "@/helpers/truncateText";
import { FavoriteCitationItemFull } from "@/hooks/Citations/useGetFavoriteCitationsFull";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	data: FavoriteCitationItemFull;
}

export default function CardFavoriteCitation({ data }: Props) {
	if (!data) {
		return <Loader />;
	}

	const handlePress = () => {
		router.push({
			pathname: "/citations",
			params: { citationCategory: data.category },
		});
	};

	return (
		<View style={styles.wrapper}>
			<TouchableOpacity onPress={handlePress}>
				<View style={styles.cardContainer}>
					<View style={styles.cardIcons}>
						<Text>{data.category}</Text>
					</View>
					<View style={styles.cardRowContent}>
						<View style={{ flexShrink: 1 }}>
							<Text style={{ fontSize: FontSizeH3, fontWeight: "bold" }}>
								{truncateString(data.citation, 50)}
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
