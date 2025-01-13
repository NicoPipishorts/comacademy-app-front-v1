import Loader from "@/components/experience/loader";
import FilteredByCat from "@/components/filters/filteredByCat";
import Searchbar from "@/components/Searchbar";
import { colorBlack } from "@/constants/colors";
import { FontSize12, FontSize22, FontSizeH4 } from "@/constants/fontsizes";
import { CategoriePayload } from "@/types/categories";
import { DicoLists, DicoSelected } from "@/types/dico";
import { NavigationType } from "@/types/general";
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
	data: DicoLists;
	categories: CategoriePayload;
	filterByCat: number | null;
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
};

const DicoList = ({ data, categories, filterByCat, setFilterByCat }: Props) => {
	const navigation = useNavigation<NavigationType>();
	const scrollViewRef = useRef<ScrollView | null>(null);
	const sectionRefs = useRef<{ [key: string]: View | null }>({}).current;
	const [groupedData, setGroupedData] = useState<{
		[key: string]: DicoSelected[];
	}>({});
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredData, setFilteredData] = useState<DicoSelected[]>([]);

	useEffect(() => {
		if (data && data.data) {
			const mappedData = data.data
				.map((item) => ({
					...item.attributes,
					id: item.id,
				}))
				.filter((item) => item.Word && item.Word !== "-");
			const grouped = groupDataByFirstLetter(mappedData, "Word");
			setGroupedData(grouped);
			setFilteredData(mappedData);
		}
	}, [data]);

	const alphabet = Object.keys(groupedData)
		.sort()
		.filter((letter) => letter !== "#"); // First, exclude the '#' from the sorting
	alphabet.push("#"); // Then add the '#' at the end

	function groupDataByFirstLetter(
		items: DicoSelected[],
		property: keyof DicoSelected
	) {
		const normalizeString = (str: string) =>
			str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

		const groups: { [key: string]: DicoSelected[] } = {};
		items.forEach((item) => {
			const propValue = item[property];
			if (typeof propValue === "string") {
				const firstChar = normalizeString(propValue).charAt(0).toUpperCase();

				// Check if the first character is a letter
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
						Word: item.attributes.Word,
						// Include any other properties that are part of DicoSelected
					}))
					.filter(
						(item) =>
							item.Word &&
							item.Word.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "")
								.toLowerCase()
								.includes(normalizedQuery)
					);

				setFilteredData(filteredResults as DicoSelected[]); // Ensure the type matches
			} else {
				// Reset to the original data if the search query is empty
				setFilteredData(
					data.data.map((item) => ({
						id: item.id,
						Word: item.attributes.Word,
						// Include any other properties that are part of DicoSelected
					}))
				);
			}
		},
		[data]
	);

	const handlePress = (id: number) => {
		navigation.navigate("dicoDetails", { id });
	};

	if (!data) {
		return <Loader />;
	}

	return (
		<>
			<View style={{ paddingTop: 30 }}>
				<Searchbar
					placeholder='Rechercher'
					onChangeText={handleSearch} // Pass the handleSearch function to the Searchbar
				/>
			</View>

			<View style={styles.contentContainer}>
				<ScrollView
					ref={scrollViewRef}
					style={styles.listWrapper}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}>
					{filterByCat && (
						<FilteredByCat
							count={data.data.length}
							categories={categories}
							filterByCat={filterByCat}
							setFilterByCat={setFilterByCat}
						/>
					)}
					{/* If search query is active, render filtered data, else render grouped data */}
					{filteredData.length <= 0 && (
						<View style={styles.noDataContainer}>
							<Text style={styles.noDataText}>
								Aucun métier de disponible.{" "}
							</Text>
							<Text>Sélectionnez une autre catégorie.</Text>
						</View>
					)}
					{searchQuery
						? filteredData.map((item, index) => (
								<TouchableOpacity
									key={index}
									onPress={() => handlePress(item.id)}>
									<Text style={styles.listItem}>{item.Word}</Text>
								</TouchableOpacity>
						  ))
						: alphabet.map((letter) => (
								<View key={letter} ref={(el) => (sectionRefs[letter] = el)}>
									{filteredData.length > 0 && (
										<Text style={styles.listHeader}>{letter}</Text>
									)}
									{groupedData[letter]?.map((item, index) => (
										<Text
											key={index}
											style={styles.listItem}
											onPress={() => handlePress(item.id)}>
											{item.Word}
										</Text>
									))}
								</View>
						  ))}
				</ScrollView>

				{!searchQuery && filteredData.length > 0 && (
					<View style={styles.sidebar}>
						{alphabet.map((letter) => (
							<TouchableOpacity
								key={letter}
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

export default DicoList;
