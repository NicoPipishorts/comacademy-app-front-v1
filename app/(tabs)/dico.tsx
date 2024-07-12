import { colorBlack, primaryBackground } from "@/constants/colors";
import { FontSize12, FontSizeH4 } from "@/constants/fontsizes";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import FloatingTabBar from "../../components/FloatingTabBar";
import ScreenHeaders from "../../components/ScreenHeaders";
import MetierCategories from "../../screens/MetierCategories";
import MetierDetails from "../../screens/MetierDetails";
import MetierList from "../../screens/MetierList";

const Dico = () => {
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;
	const scrollViewRef = useRef();
	const sectionRefs = useRef({}).current;
	const [groupedData, setGroupedData] = useState({});

	const { data } = useQuery({
		queryKey: ["metiers"],
		queryFn: () =>
			fetch(`${apiUrl}/metiers?populate=*`).then((res) => res.json()),
	});

	const [showDetails, setShowDetails] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);
	const [selectedTab, setSelectedTab] = useState(false);

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
			<ScreenHeaders content='Dico' />

			{!selectedTab && (
				<MetierList
					setShowDetails={setShowDetails}
					setSelectedItem={setSelectedItem}
				/>
			)}

			{selectedTab && <MetierCategories />}

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					selectedTab={selectedTab}
					setSelectedTab={setSelectedTab}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 80,
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
		bottom: 113,
		elevation: 5,
		zIndex: 1,
	},
});

export default Dico;
