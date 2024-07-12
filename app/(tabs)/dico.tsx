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
	// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
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
			// @ts-expect-error TS(7006): Parameter 'item' implicitly has an 'any' type.
			const mappedData = data.data.map((item) => item.attributes); // Accessing attributes of each item
			const grouped = groupDataByFirstLetter(mappedData, "METIER");
			setGroupedData(grouped);
		}
	}, [data]);

	const alphabet = Object.keys(groupedData).sort();

	// @ts-expect-error TS(7006): Parameter 'items' implicitly has an 'any' type.
	function groupDataByFirstLetter(items, property) {
		// Sort items alphabetically based on the property
		// @ts-expect-error TS(7006): Parameter 'a' implicitly has an 'any' type.
		items.sort((a, b) => a[property].localeCompare(b[property]));

		// Group by the first letter of the property
		const groups = {};
		// @ts-expect-error TS(7006): Parameter 'item' implicitly has an 'any' type.
		items.forEach((item) => {
			const letter = item[property][0].toUpperCase();
			// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			if (!groups[letter]) {
				// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				groups[letter] = [];
			}
			// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			groups[letter].push(item);
		});

		return groups;
	}

	// Scroll by letter function
	// @ts-expect-error TS(7006): Parameter 'letter' implicitly has an 'any' type.
	const scrollToSection = (letter) => {
		// Find the current ref for the selected letter
		// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		const section = sectionRefs[letter];

		// Use the ref to scroll into view
		if (section && scrollViewRef.current) {
			// Measure the position of the element
			section.measureLayout(
				scrollViewRef.current,
				// @ts-expect-error TS(7006): Parameter 'x' implicitly has an 'any' type.
				(x, y, width, height) => {
					// @ts-expect-error TS(2532): Object is possibly 'undefined'.
					scrollViewRef.current.scrollTo({ x: 0, y, animated: true });
				},
				// @ts-expect-error TS(7006): Parameter 'error' implicitly has an 'any' type.
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
				// @ts-expect-error TS(2739): Type '{ setShowDetails: Dispatch<SetStateAction<bo... Remove this comment to see the full error message
				<MetierList
					setShowDetails={setShowDetails}
					setSelectedItem={setSelectedItem}
				/>
			)}
			// @ts-expect-error TS(2741): Property 'setFilterByCat' is missing in type
			'{}' ... Remove this comment to see the full error message
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
