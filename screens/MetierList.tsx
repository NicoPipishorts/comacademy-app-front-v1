import { colorBlack, colorGrey } from "@/constants/colors";
import { FontSize12, FontSize22, FontSizeH4 } from "@/constants/fontsizes";
import { CategoriePayload } from "@/types/cotegories";
import { MetiersList, SelectedMetier } from "@/types/metiers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, {
	Dispatch,
	SetStateAction,
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
import Searchbar from "../components/Searchbar";

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
	const scrollViewRef = useRef<ScrollView | null>(null);
	const sectionRefs = useRef<{ [key: string]: View | null }>({}).current;
	const [groupedData, setGroupedData] = useState<{
		[key: string]: SelectedMetier[];
	}>({});

	console.log(data.data);

	useEffect(() => {
		if (data && data.data) {
			const mappedData = data.data.map((item) => {
				return {
					...item.attributes,
					id: item.id,
				};
			});
			const grouped = groupDataByFirstLetter(mappedData, "METIER");
			setGroupedData(grouped);
		}
	}, [data]);

	const alphabet = Object.keys(groupedData).sort();

	function isString(value: any): value is string {
		return typeof value === "string";
	}

	function groupDataByFirstLetter(
		items: SelectedMetier[],
		property: keyof SelectedMetier
	) {
		// Sort items alphabetically based on the property
		items.sort((a, b) => {
			const propA = a[property];
			const propB = b[property];

			if (typeof propA === "string" && typeof propB === "string") {
				return propA.localeCompare(propB);
			}
			return 0; // Handle non-string values by considering them equal
		});

		// Group by the first letter of the property
		const groups: { [key: string]: SelectedMetier[] } = {};
		items.forEach((item) => {
			const propValue = item[property];
			if (typeof propValue === "string") {
				const letter = propValue.charAt(0).toUpperCase();
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

	if (!data) return null;
	return (
		<>
			<View style={{ paddingTop: 30 }}>
				<Searchbar placeholder='Rechercher' />
			</View>

			{data.data.length <= 0 && (
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
						<View style={styles.filterCWrapper}>
							<Text>Filtre: </Text>
							<TouchableOpacity
								style={styles.filterContainer}
								onPress={() => setFilterByCat(null)}>
								<Text style={styles.filterText}>
									{categories.data[filterByCat]?.attributes.Title} {filterByCat}
								</Text>
								<MaterialCommunityIcons
									name='close-circle-outline'
									size={24}
									color={colorBlack}
								/>
							</TouchableOpacity>
						</View>
					)}

					{alphabet.map((letter) => (
						<View key={letter} ref={(el) => (sectionRefs[letter] = el)}>
							<Text style={styles.listHeader}>{letter}</Text>
							{groupedData[letter]?.map((item, index) => {
								// console.log("Item:", item);
								return (
									<Text
										key={index}
										style={styles.listItem}
										onPress={() => {
											setSelectedItem(item);
											setShowDetails(true);
										}}>
										{item.METIER}
									</Text>
								);
							})}
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
