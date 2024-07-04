import { colorBlack, primaryBackground } from "@/constants/colors";
import { FontSize12, FontSizeH4 } from "@/constants/fontsizes";
import React, { useEffect, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import FloatingTabBar from "../components/FloatingTabBar";
import ScreenHeaders from "../components/ScreenHeaders";
import Searchbar from "../components/Searchbar";
import { dataMetiers } from "../mocdata/metiers";

const Metier = () => {
	const [groupedData, setGroupedData] = useState({});
	const data = dataMetiers;

	useEffect(() => {
		const grouped = groupDataByFirstLetter(data, "title");
		setGroupedData(grouped);
	}, [data]);

	const alphabet = Object.keys(groupedData).sort();

	function groupDataByFirstLetter(items, property) {
		// Sort items alphabetically based on the property
		items.sort((a, b) => a[property].localeCompare(b[property]));

		// Group by the first letter of the property
		const groups = {};
		items.forEach((item) => {
			const letter = item[property][0].toUpperCase();
			if (!groups[letter]) {
				groups[letter] = [];
			}
			groups[letter].push(item);
		});

		return groups;
	}

	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Métiers' />

			<View style={{ paddingTop: 50, paddingHorizontal: 10 }}>
				<Searchbar placeholder='Rechercher' />
			</View>

			<View style={styles.contentContainer}>
				<ScrollView
					style={styles.listContainer}
					showsVerticalScrollIndicator={false}>
					{alphabet.map((letter) => (
						<View key={letter}>
							<Text style={styles.listHeader}>{letter}</Text>
							{groupedData[letter].map((item, index) => (
								<Text key={index} style={styles.listItem}>
									{item.title}
								</Text>
							))}
						</View>
					))}
				</ScrollView>

				<View style={styles.sidebar}>
					{alphabet.map((letter) => (
						<TouchableOpacity key={letter} onPress={() => {}}>
							<Text style={styles.sidebarText}>{letter}</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 20,
		paddingTop: 100,
		backgroundColor: primaryBackground,
	},
	contentContainer: {
		flexDirection: "row",
		flex: 1,
		marginTop: 20,
		marginBottom: 100,
	},
	listContainer: {
		flex: 1,
		paddingHorizontal: 10,
	},
	listHeader: {
		fontWeight: "500",
		fontSize: FontSizeH4,
		paddingTop: 25,
		paddingBottom: 10,
	},
	listItem: {
		paddingVertical: 4,
		color: colorBlack,
		fontSize: 16,
		fontWeight: "500",
	},
	sidebar: {
		width: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	sidebarText: {
		padding: 1,
		fontSize: FontSize12,
		fontWeight: "bold",
	},
	floatingTabbarContainer: {
		backgroundColor: "transparent",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 140,
		elevation: 5,
		zIndex: 1,
	},
});

export default Metier;
