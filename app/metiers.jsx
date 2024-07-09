import { colorBlack, primaryBackground } from "@/constants/colors";
import { FontSize12, FontSizeH4 } from "@/constants/fontsizes";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
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
import MetierDetails from "../screens/MetierDetails";

const Metier = () => {
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;
	const scrollViewRef = useRef();
	const sectionRefs = useRef({}).current;
	const [groupedData, setGroupedData] = useState({});
	// const data = dataMetiers;

	const { data } = useQuery({
		queryKey: ["metiers"],
		queryFn: () => fetch(`${apiUrl}/metiers`).then((res) => res.json()),
	});

	const [showDetails, setShowDetails] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);

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

	// Scroll by letter function
	const scrollToSection = (letter) => {
		// Find the current ref for the selected letter
		const section = sectionRefs[letter];

		// Use the ref to scroll into view
		if (section && scrollViewRef.current) {
			// Measure the position of the element
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

	if (showDetails && selectedItem) {
		return (
			<MetierDetails
				item={selectedItem}
				onGoBack={() => setShowDetails(false)}
			/>
		);
	}

	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Métiers' />

			<View style={{ paddingTop: 30 }}>
				<Searchbar placeholder='Rechercher' />
			</View>

			<View style={styles.contentContainer}>
				<ScrollView
					ref={scrollViewRef}
					style={styles.listWrapper}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}>
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

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		backgroundColor: primaryBackground,
	},
	contentContainer: {
		flexDirection: "row",
		flex: 1,
		marginTop: 20,
		marginBottom: 100,
	},
	listWrapper: {
		flex: 1,
	},
	listContainer: {
		paddingBottom: 100, // Adjust this value as needed
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
