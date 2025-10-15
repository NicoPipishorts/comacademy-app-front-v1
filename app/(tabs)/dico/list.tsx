import FilteredByCat from "@/components/filters/filteredByCat";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import Searchbar from "@/components/Searchbar";
import { colorBlack } from "@/constants/colors";
import { FontSize12, FontSize22, FontSizeH3 } from "@/constants/fontsizes";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
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
import DicoListSkeleton from "./DicoListSkeleton";

type Props = {
	data: DicoLists;
	categories: CategoriePayload;
	filterByCat: number | null;
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
	isLoading: boolean;
};

const DicoList = ({
	data,
	categories,
	filterByCat,
	setFilterByCat,
	isLoading,
}: Props) => {
	const navigation = useNavigation<NavigationType>();
	const scrollViewRef = useRef<ScrollView | null>(null);
	const sectionRefs = useRef<Record<string, View | null>>({});
	const [groupedData, setGroupedData] = useState<{
		[key: string]: DicoSelected[];
	}>({});
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredData, setFilteredData] = useState<DicoSelected[]>([]);
	const [showSkeleton, setShowSkeleton] = useState(true);
	const loadingStartTimeRef = useRef<number>(Date.now());

	const {
		isItemLocked,
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
	} = useSubscriptionLimit({ freeLimit: 10 });

	useEffect(() => {
		if (!isLoading && data) {
			const MINIMUM_LOADING_TIME = 2000; // ms
			const elapsedTime = Date.now() - loadingStartTimeRef.current;
			const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);

			const timer = setTimeout(() => {
				setShowSkeleton(false);
			}, remainingTime);

			return () => clearTimeout(timer);
		}
		return undefined;
	}, [isLoading, data]);

	useEffect(() => {
		if (data && data.data) {
			const mappedData = data.data
				.map((item) => ({
					...item.attributes,
					id: item.id,
				}))
				.filter((item) => item.Word && item.Word !== "-")
				.sort((a, b) => a.Word.localeCompare(b.Word));
			const grouped = groupDataByFirstLetter(mappedData, "Word");
			setGroupedData(grouped);
			setFilteredData(mappedData);
		}
	}, [data]);

	const alphabet = Object.keys(groupedData)
		.sort()
		.filter((letter) => letter !== "#");
	alphabet.push("#");

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

				const letter = /^[A-Z]$/.test(firstChar) ? firstChar : "#";

				if (!groups[letter]) {
					groups[letter] = [];
				}
				groups[letter].push(item);
			}
		});
		Object.keys(groups).forEach((key) => {
			groups[key].sort((a, b) => a.Word.localeCompare(b.Word));
		});
		return groups;
	}

	const scrollToSection = (letter: string) => {
		const section = sectionRefs.current[letter];

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
						id: item.id,
						Word: item.attributes.Word,
					}))
					.filter(
						(item) =>
							item.Word &&
							item.Word.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "")
								.toLowerCase()
								.includes(normalizedQuery)
					)
					.sort((a, b) => a.Word.localeCompare(b.Word));

				setFilteredData(filteredResults as DicoSelected[]);
			} else {
				setFilteredData(
					data.data
						.map((item) => ({
							id: item.id,
							Word: item.attributes.Word,
						}))
						.sort((a, b) => a.Word.localeCompare(b.Word))
				);
			}
		},
		[data]
	);

	const handlePress = (id: number, index: number) => {
		if (isItemLocked(index)) {
			handleLockedItemPress();
			return;
		}
		navigation.navigate("dicoDetails", { id });
	};

	return (
		<>
			<View style={{ paddingTop: 30 }}>
				<Searchbar placeholder='Rechercher' onChangeText={handleSearch} />
			</View>

			{(showSkeleton || isLoading || !data) && <DicoListSkeleton lines={15} />}
			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message="Les 10 premiers mots du dictionnaire sont gratuits. Passez à un abonnement premium pour accéder à l'intégralité du dictionnaire."
			/>

			{!showSkeleton && !isLoading && data && (
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
						{searchQuery
							? filteredData.map((item, index) => {
									const locked = isItemLocked(index);
									return (
										<TouchableOpacity
											key={index}
											onPress={() => handlePress(item.id, index)}>
											<Text
												style={[styles.listItem, locked && styles.lockedItem]}>
												{item.Word}
											</Text>
										</TouchableOpacity>
									);
							  })
							: (() => {
									let globalIndex = 0;
									return alphabet.map((letter) => (
										<View
											key={letter}
											ref={(el) => {
												sectionRefs.current[letter] = el;
											}}>
											<Text style={styles.listHeader}>{letter}</Text>
											{groupedData[letter]?.map((item, localIndex) => {
												const currentIndex = globalIndex++;
												const locked = isItemLocked(currentIndex);
												return (
													<Text
														key={localIndex}
														style={[
															styles.listItem,
															locked && styles.lockedItem,
														]}
														onPress={() => handlePress(item.id, currentIndex)}>
														{item.Word}
													</Text>
												);
											})}
										</View>
									));
							  })()}
						{searchQuery && filteredData.length === 0 && (
							<View style={styles.noDataContainer}>
								<Text style={styles.noDataText}>Aucun résultat trouvé.</Text>
							</View>
						)}
					</ScrollView>

					{!showSkeleton && !searchQuery && filteredData.length > 0 && (
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
			)}
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
		paddingHorizontal: 5,
		paddingBottom: 70,
	},

	listHeader: {
		fontWeight: "bold",
		fontSize: FontSizeH3,
		paddingVertical: 5,
		marginTop: 20,
		overflow: "hidden",
	},
	listItem: {
		paddingVertical: 5,
		color: colorBlack,
		fontSize: 18,
		fontWeight: "500",
	},
	lockedItem: {
		opacity: 0.4,
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

export default React.memo(DicoList);
