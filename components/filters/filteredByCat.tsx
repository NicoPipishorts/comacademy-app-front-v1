import { colorBlack, colorGrey } from "@/constants/colors";
import { CategoriePayload } from "@/types/categories";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	categories: CategoriePayload;
	filterByCat: number;
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
}

export default function FilteredByCat({
	categories,
	setFilterByCat,
	filterByCat,
}: Props) {
	const categoriesArray = categories.data; // The original array of categories

	// Transform the array into an object indexed by 'id'
	const categoriesById = categoriesArray.reduce((acc, category) => {
		acc[category.id] = category;
		return acc;
	}, {});

	return (
		<View style={styles.filterCWrapper}>
			<Text>Filtre: </Text>
			<TouchableOpacity
				style={styles.filterContainer}
				onPress={() => setFilterByCat(null)}>
				<Text style={styles.filterText}>
					{categoriesById[filterByCat]?.attributes.Title}
				</Text>
				<MaterialCommunityIcons
					name='close-circle-outline'
					size={24}
					color={colorBlack}
				/>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		flexDirection: "row",
		flex: 1,
		marginTop: 20,
		marginBottom: 80,
	},
	filterCWrapper: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
	},
	filterContainer: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 50,
		backgroundColor: colorGrey,
	},
	filterText: {
		fontWeight: "bold",
		paddingRight: 10,
	},
});
