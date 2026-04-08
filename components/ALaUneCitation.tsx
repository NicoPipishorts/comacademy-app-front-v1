import { colorWhite } from "@/constants/colors";
import { FontSize12, FontSize20 } from "@/constants/fontsizes";
import useDailyCitations from "@/hooks/Citations/useGetDailyCitations";
import { router } from "expo-router";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SkeletonBlock from "./experience/SkeletonBlock";
import StyledButton from "./StyledButton";

export default function ALaUneCitation() {
	const { data, isFetched } = useDailyCitations();
	const citation = data?.data;
	const isLoading = !isFetched || !citation;

	const handlePress = () => {
		router.push({
			pathname: "/activity/CitationSolo",
			params: { fromDaily: "true" },
		});
	};

	return (
		<TouchableOpacity
			style={styles.container}
			disabled={isLoading}
			activeOpacity={isLoading ? 1 : 0.2}>
			<Text style={styles.smallText}>
				{isLoading
					? "La citation du jour"
					: `La citation du jour : ${format(new Date(citation.updatedAt), "dd/MM/yyyy")}`}
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
							{citation.CITATION}
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
