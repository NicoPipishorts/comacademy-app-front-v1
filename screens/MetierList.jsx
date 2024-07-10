import { colorBlack } from "@/constants/colors";
import { FontSize12, FontSize22, FontSizeH4 } from "@/constants/fontsizes";
import React, { useEffect, useRef, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Searchbar from "../components/Searchbar";

const MetierList = ({
	data,
	setShowDetails,
	setSelectedItem,
	filterByCat,
	setFilterByCat,
}) => {
	const scrollViewRef = useRef();
	const sectionRefs = useRef({}).current;
	const [groupedData, setGroupedData] = useState({});

	console.log(data);

	useEffect(() => {
		if (data && data.data) {
			const mappedData = data.data.map((item) => item.attributes); // Accessing attributes of each item
			const grouped = groupDataByFirstLetter(mappedData, "METIER");
			setGroupedData(grouped);
		}
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

	const scrollToSection = (letter) => {
		const section = sectionRefs[letter];

		if (section && scrollViewRef.current) {
			section.measureLayout(
				scrollViewRef.current,
				(x, y, width, height) => {
					scrollViewRef.current.scrollTo({ x: 0, y, animated: true });
				},
				(error) => {
					console.error("Failed to find element", error);
				}
			);
		}
	};
	return (
		<>
			<View style={{ paddingTop: 30 }}>
				<Searchbar placeholder='Rechercher' />
			</View>

			{data.data.length <= 0 && (
				<View style={styles.noDataContainer}>
					<Text style={styles.noDataText}>Aucun métier de disponible. </Text>
					<Text>Sélectionnez une autre catégorie. catégorie.</Text>
				</View>
			)}

			<View style={styles.contentContainer}>
				<ScrollView
					ref={scrollViewRef}
					style={styles.listWrapper}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}>
					{filterByCat && (
						<View>
							<Text>Cat chosen is {filterByCat}</Text>
							<TouchableOpacity onPress={() => setFilterByCat(null)}>
								<Text>Remove Filter</Text>
							</TouchableOpacity>
						</View>
					)}
					{alphabet.map((letter) => (
						<View key={letter} ref={(el) => (sectionRefs[letter] = el)}>
							<Text style={styles.listHeader}>{letter}</Text>
							{groupedData[letter].map((item, index) => (
								<Text
									key={index}
									style={styles.listItem}
									onPress={() => {
										setSelectedItem(item);
										setShowDetails(true);
									}}>
									{item.METIER}
								</Text>
							))}
						</View>
					))}
				</ScrollView>

				<View style={styles.sidebar}>
					{alphabet.map((letter) => (
						<TouchableOpacity
							key={letter}
							onPress={() => scrollToSection(letter)}>
							<Text style={styles.sidebarText}>{letter}</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
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
		paddingBottom: 80, // Adjust this value as needed
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
	noDataContainer: {
		flex: 1,
		minHeight: "50%",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
	},
	noDataText: {
		fontSize: FontSize22,
		fontWeight: "bold",
		marginBottom: 20,
	},
});

export default MetierList;
