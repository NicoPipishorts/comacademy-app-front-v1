import FilteredByCat from "@/components/filters/filteredByCat";
import Searchbar from "@/components/Searchbar";
import { colorBlack, colorGrey } from "@/constants/colors";
import { FontSize12, FontSize22, FontSizeH4 } from "@/constants/fontsizes";
import { CategoriePayload } from "@/types/categories";
import { NavigationType } from "@/types/general";
import { MetiersList, SelectedMetier } from "@/types/metiers";
import { useNavigation } from "expo-router";
import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type Props = {
	data: MetiersList;
	categories: CategoriePayload;
	setShowDetails: Dispatch<SetStateAction<boolean>>;
	setSelectedItem: Dispatch<SetStateAction<SelectedMetier | null>>;
	filterByCat: number | null;
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
};

const MetierList = ({
	data,
	categories,
	setShowDetails,
	setSelectedItem,
	filterByCat,
	setFilterByCat,
}: Props) => {
	const navigation = useNavigation<NavigationType>();
	const scrollViewRef = useRef<ScrollView | null>(null);
	const sectionRefs = useRef<{ [key: string]: View | null }>({}).current;
	const [groupedData, setGroupedData] = useState<{
		[key: string]: SelectedMetier[];
	}>({});
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredData, setFilteredData] = useState<SelectedMetier[]>([]);

	useEffect(() => {
		if (data && data.data) {
			const mappedData = data.data.map((item) => ({
				...item.attributes,
				id: item.id,
			}));
			const grouped = groupDataByFirstLetter(mappedData, "METIER");
			setGroupedData(grouped);
			setFilteredData(mappedData); // Initialize filtered data with all items
		}
	}, [data]);

	const alphabet = Object.keys(groupedData).sort();
	function groupDataByFirstLetter(
		items: SelectedMetier[],
		property: keyof SelectedMetier
	) {
		const normalizeString = (str: string) =>
			str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

		items.sort((a, b) => {
			const propA = a[property];
			const propB = b[property];

			if (typeof propA === "string" && typeof propB === "string") {
				return normalizeString(propA).localeCompare(normalizeString(propB));
			}
			return 0;
		});

		const groups: { [key: string]: SelectedMetier[] } = {};
		items.forEach((item) => {
			const propValue = item[property];
			if (typeof propValue === "string") {
				const firstChar = normalizeString(propValue).charAt(0).toUpperCase();

				// Group numbers and special characters under '#'
				const letter = /^[A-Z]$/.test(firstChar) ? firstChar : "#";

				if (!groups[letter]) {
					groups[letter] = [];
				}
				groups[letter].push(item);
			}
		});

		return groups;
	}

	const scrollToSection = (letter: string) => {
		const section = sectionRefs[letter];

		if (section && scrollViewRef.current) {
			const scrollView = scrollViewRef.current as unknown as any;
			section.measureLayout(
				scrollView,
				(x, y, width, height) => {
					scrollView.scrollTo({ x: 0, y, animated: true });
				},
				() => {
					console.error("Failed to find element");
				}
			);
		}
	};

	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query);
			if (query) {
				const normalizedQuery = query
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.toLowerCase();

				const filteredResults = data.data
					.map((item) => ({
						id: item.id, // Ensure that id is included
						METIER: item.attributes.METIER,
						// Include any other properties that are part of SelectedMetier
					}))
					.filter(
						(item) =>
							item.METIER &&
							item.METIER.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "")
								.toLowerCase()
								.includes(normalizedQuery)
					);

				setFilteredData(filteredResults as SelectedMetier[]); // Ensure the type matches
			} else {
				// Reset to the original data if the search query is empty
				setFilteredData(
					data.data.map((item) => ({
						id: item.id,
						METIER: item.attributes.METIER,
						// Include any other properties that are part of SelectedMetier
					}))
				);
			}
		},
		[data]
	);

	const handlePress = (id: number) => {
		navigation.navigate("metierDetails", { id });
	};

	if (!data) return null;
	return (
		<>
			<View style={{ paddingTop: 30 }}>
				<Searchbar
					placeholder='Rechercher'
					onChangeText={handleSearch} // Pass the handleSearch function to the Searchbar
				/>
			</View>

			{filteredData.length <= 0 && (
				<View style={styles.noDataContainer}>
					<Text style={styles.noDataText}>Aucun métier de disponible. </Text>
					<Text>Sélectionnez une autre catégorie.</Text>
				</View>
			)}

			<View style={styles.contentContainer}>
				<ScrollView
					ref={scrollViewRef}
					style={styles.listWrapper}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}>
					{filterByCat && (
						<FilteredByCat
							categories={categories}
							filterByCat={filterByCat}
							setFilterByCat={setFilterByCat}
						/>
					)}

					{/* If search query is active, render filtered data, else render grouped data */}
					{searchQuery
						? filteredData.map((item, index) => (
								<Text
									key={index}
									style={styles.listItem}
									onPress={() => {
										setSelectedItem(item);
										setShowDetails(true);
									}}>
									{item.METIER}
								</Text>
						  ))
						: alphabet.map((letter) => (
								<View key={letter} ref={(el) => (sectionRefs[letter] = el)}>
									<Text style={styles.listHeader}>{letter}</Text>
									{groupedData[letter]?.map((item, index) => (
										<TouchableOpacity
											key={index}
											onPress={() => handlePress(item.id)}>
											<Text style={styles.listItem}>{item.METIER}</Text>
										</TouchableOpacity>
									))}
								</View>
						  ))}
				</ScrollView>

				{!searchQuery && (
					<View style={styles.sidebar}>
						{alphabet.map((letter, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => scrollToSection(letter)}>
								<Text style={styles.sidebarText}>{letter}</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
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
