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
import SkeletonBlock from "./experience/SkeletonBlock";
import StyledButton from "./StyledButton";

export default function ALaUneDico() {
	const navigation = useNavigation<NavigationType>();
	const { data, isFetched } = useGetOneDico();
	const firstEntry = data?.data?.[0];
	const isLoading = !isFetched || !firstEntry;

	const attributes = firstEntry
		? (resolveEntityAttributes<DicoAttributes>(firstEntry) ??
			firstEntry.attributes)
		: null;

	const updatedAtValue =
		attributes?.updatedAt ??
		(attributes as { updated_at?: string } | null)?.updated_at ??
		"";

	const parsedDate = updatedAtValue ? new Date(updatedAtValue) : null;
	const formattedDate =
		parsedDate && !Number.isNaN(parsedDate.getTime())
			? format(parsedDate, "dd/MM/yyyy")
			: "N/A";

	const handlePress = () => {
		if (!firstEntry) return;
		navigation.navigate("dico", { openDetails: firstEntry.id });
	};

	return (
		<TouchableOpacity
			style={styles.container}
			disabled={isLoading}
			activeOpacity={isLoading ? 1 : 0.2}>
			<Text style={styles.smallText}>
				{isLoading ? "La définition du jour" : `La définition du jour : ${formattedDate}`}
			</Text>
			<View style={styles.containerBis}>
				{isLoading ? (
					<>
						<View style={styles.textSkeletonContainer}>
							<SkeletonBlock style={styles.lineLarge} />
							<SkeletonBlock style={styles.lineMedium} />
						</View>
						<SkeletonBlock style={styles.buttonSkeleton} />
					</>
				) : (
					<>
						<Text
							style={styles.mainText}
							numberOfLines={2}
							ellipsizeMode='tail'>
							{attributes?.Word ?? (attributes as { Word?: string }).Word ?? ""}
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
		width: "100%",
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
	textSkeletonContainer: {
		flex: 1,
		maxWidth: "65%",
	},
	lineLarge: {
		height: 22,
		width: "95%",
		marginBottom: 10,
	},
	lineMedium: {
		height: 22,
		width: "72%",
	},
	buttonSkeleton: {
		width: 92,
		height: 40,
		borderRadius: 50,
	},
});
