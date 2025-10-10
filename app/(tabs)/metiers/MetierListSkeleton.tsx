import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colorGrey, searchbarBackground } from "@/constants/colors";

type Props = {
	lines?: number;
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

const MetierListSkeleton = ({ lines = 18 }: Props) => {
	const placeholders = Array.from({ length: lines });

	return (
		<>
			<View style={styles.searchContainer}>
				<View style={styles.searchSkeleton} />
			</View>

			<View style={styles.contentContainer}>
				<ScrollView
					style={styles.listWrapper}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}>
					<View style={styles.filterSkeleton} />
					{placeholders.map((_, index) => (
						<View
							key={index}
							style={[
								styles.lineSkeleton,
								index % 3 === 0 ? styles.shortLine : undefined,
							]}
						/>
					))}
				</ScrollView>

				<View style={styles.sidebar}>
					{alphabet.map((letter) => (
						<View key={letter} style={styles.sidebarDot} />
					))}
				</View>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	searchContainer: {
		paddingTop: 30,
	},
	searchSkeleton: {
		height: 48,
		borderRadius: 12,
		backgroundColor: searchbarBackground,
	},
	contentContainer: {
		flexDirection: "row",
		flex: 1,
		marginTop: 20,
		marginBottom: 80,
	},
	listWrapper: {
		flex: 1,
	},
	listContainer: {
		paddingBottom: 80,
	},
	filterSkeleton: {
		height: 32,
		borderRadius: 16,
		backgroundColor: colorGrey,
		marginBottom: 24,
		width: "60%",
		alignSelf: "flex-start",
	},
	lineSkeleton: {
		width: "100%",
		height: 20,
		borderRadius: 10,
		marginBottom: 16,
		backgroundColor: colorGrey,
	},
	shortLine: {
		width: "70%",
	},
	sidebar: {
		width: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	sidebarDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: colorGrey,
		marginVertical: 6,
	},
});

export default MetierListSkeleton;
