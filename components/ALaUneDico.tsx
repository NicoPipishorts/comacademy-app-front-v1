import { colorWhite } from "@/constants/colors";
import { FontSize12, FontSize20 } from "@/constants/fontsizes";
import { resolveEntityAttributes } from "@/helpers/strapi";
import useGetOneDico from "@/hooks/useGetOneDico";
import { DicoAttributes } from "@/types/dico";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Loader from "./experience/loader";
import StyledButton from "./StyledButton";

export default function ALaUneDico() {
	const navigation = useNavigation<NavigationType>();
	const { data, isFetched } = useGetOneDico();

	if (!isFetched) return null;

	const firstEntry = data?.data?.[0];
	if (!firstEntry) return null;

	const attributes =
		resolveEntityAttributes<DicoAttributes>(firstEntry) ??
		firstEntry.attributes;
	if (!attributes) return null;

	const updatedAtValue =
		attributes.updatedAt ??
		(attributes as { updated_at?: string }).updated_at ??
		"";

	const parsedDate = updatedAtValue ? new Date(updatedAtValue) : null;
	const formattedDate =
		parsedDate && !Number.isNaN(parsedDate.getTime())
			? format(parsedDate, "dd/MM/yyyy")
			: "N/A";

	const handlePress = () => {
		navigation.navigate("dico", { openDetails: firstEntry.id });
	};

	return (
		<TouchableOpacity style={styles.container}>
			<Text style={styles.smallText}>
				La définition du jour : {formattedDate}
			</Text>
			<View style={styles.containerBis}>
				{!isFetched && <Loader />}
				{isFetched && (
					<>
						<Text
							style={styles.mainText}
							numberOfLines={2}
							ellipsizeMode='tail'>
							{attributes.Word ?? (attributes as { Word?: string }).Word ?? ""}
						</Text>
						<StyledButton
							title='Découvrir'
							handlePress={handlePress}
							variant='dark'
						/>
					</>
				)}
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colorWhite,
		width: 350,
		minHeight: 100,
		padding: 15,
		borderRadius: 10,
		marginBottom: 20,
	},
	smallText: {
		fontSize: FontSize12,
		fontWeight: "bold",
		paddingBottom: 15,
	},
	containerBis: {
		flex: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	mainText: {
		flex: 1,
		maxWidth: "65%",
		fontSize: FontSize20,
		fontWeight: "bold",
	},
});
