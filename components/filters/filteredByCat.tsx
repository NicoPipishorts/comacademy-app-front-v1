import { colorBlack, colorGrey } from "@/constants/colors";
import { CategoriePayload } from "@/types/categories";
import { NavigationType } from "@/types/general";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { Dispatch, SetStateAction } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	count?: number;
	// either a full payload or just the category title as a string
	categories: CategoriePayload | string;
	filterByCat: number;
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
}

export default function FilteredByCat({
	categories,
	filterByCat,
	setFilterByCat,
	count,
}: Props) {
	const navigation = useNavigation<NavigationType>();

	console.log(categories);

	// figure out the display title & id
	let title: string;
	if (typeof categories === "string") {
		// if they passed a string, use it directly
		title = categories;
	} else {
		// otherwise find the matching category in the payload
		const match = categories.data.find((c) => c.id === filterByCat);
		title = match?.attributes.Title ?? "Unknown";
	}

	const onPress = () => {
		setFilterByCat(null);
		navigation.navigate("index");
	};

	return (
		<View style={styles.filterCWrapper}>
			<TouchableOpacity style={styles.filterContainer} onPress={onPress}>
				<Text style={styles.filterText}>
					{title}
					{count != null ? `: ${count}` : ""}
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
