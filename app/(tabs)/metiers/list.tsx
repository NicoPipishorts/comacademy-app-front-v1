import FilteredByCat from "@/components/filters/filteredByCat";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import Searchbar from "@/components/Searchbar";
import { colorBlack } from "@/constants/colors";
import { FontSize12, FontSize22, FontSizeH3 } from "@/constants/fontsizes";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
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
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const SIDEBAR_HIT_SLOP = { top: 4, bottom: 4, left: 12, right: 12 } as const;

type Props = {
	data: MetiersList | null;
	categories: CategoriePayload | null;
	filterByCat: number | null;
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
	headerTitle: string;
	isLoading?: boolean;
	refreshing?: boolean;
	onRefresh?: () => void;
};

const MetierList = ({
	data,
	categories,
	filterByCat,
	setFilterByCat,
	headerTitle,
	isLoading = false,
	refreshing = false,
	onRefresh,
}: Props) => {
	const navigation = useNavigation<NavigationType>();
	const scrollViewRef = useRef<ScrollView | null>(null);
	const sectionRefs = useRef<{ [key: string]: View | null }>({}).current;
	const [groupedData, setGroupedData] = useState<{
		[key: string]: SelectedMetier[];
	}>({});
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredData, setFilteredData] = useState<SelectedMetier[]>([]);
	const [showSkeleton, setShowSkeleton] = useState(true);
	const loadingStartTimeRef = useRef<number>(Date.now());

	const {
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
		isFreeUser,
	} = useSubscriptionLimit({ freeLimit: 0 }); // Not using index-based locking for metiers

	// Custom logic: Lock items after the first one in each letter group
	const isMetierLocked = useCallback(
		(indexInGroup: number): boolean => {
			if (!isFreeUser) return false;
			return indexInGroup > 0; // Lock all items except the first in each group
		},
		[isFreeUser],
	);

	useEffect(() => {
		if (!isLoading && data && categories) {
			const MINIMUM_LOADING_TIME = 2000; // ms
			const elapsedTime = Date.now() - loadingStartTimeRef.current;
			const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);

			const timer = setTimeout(() => {
				setShowSkeleton(false);
			}, remainingTime);

			return () => clearTimeout(timer);
		}
		return undefined;
	}, [isLoading, data, categories]);

	useEffect(() => {
		if (data && data.data) {
			const mappedData = data.data.map((item) => ({
				id: item.id,
				METIER: item.METIER,
			}));
			const grouped = groupDataByFirstLetter(mappedData, "METIER");
			setGroupedData(grouped);
			setFilteredData(mappedData); // Initialize filtered data with all items
		} else {
			setGroupedData({});
			setFilteredData([]);
		}
	}, [data]);

	const alphabet = Object.keys(groupedData).sort();
	function groupDataByFirstLetter(
		items: SelectedMetier[],
		property: keyof SelectedMetier,
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
				},
			);
		}
	};

	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query);
			if (!data?.data) {
				setFilteredData([]);
				return;
			}
			if (query) {
				const normalizedQuery = query
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.toLowerCase();

				const filteredResults = data.data
					.map((item) => ({
						id: item.id,
						METIER: item.METIER,
					}))
					.filter(
						(item) =>
							item.METIER &&
							item.METIER.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "")
								.toLowerCase()
								.includes(normalizedQuery),
					);

				setFilteredData(filteredResults as SelectedMetier[]);
			} else {
				// Reset to the original data if the search query is empty
				setFilteredData(
					data.data.map((item) => ({
						id: item.id,
						METIER: item.METIER,
					})),
				);
			}
		},
		[data],
	);

	const handlePress = (id: number, indexInGroup: number) => {
		if (isMetierLocked(indexInGroup)) {
			handleLockedItemPress();
			return;
		}
		navigation.navigate("metierDetails", { id });
	};

	const isListLoading = showSkeleton || isLoading || !data || !categories;

	return (
		<>
			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message='Un métier de chaque lettre est gratuit. Passez à un abonnement premium pour accéder à tous les métiers.'
			/>

			<View style={styles.contentContainer}>
				<ScrollView
					refreshControl={
						onRefresh ? (
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								tintColor={colorBlack}
							/>
						) : undefined
					}
					ref={scrollViewRef}
					style={styles.listWrapper}
					contentContainerStyle={styles.listContainer}
					stickyHeaderIndices={[1]}
					showsVerticalScrollIndicator={false}>
					<PageTitleAvatarHeader
						title={headerTitle}
						containerStyle={styles.listPageHeader}
					/>
					<View style={styles.stickySearchContainer}>
						<Searchbar
							placeholder='Rechercher'
							onChangeText={handleSearch}
							containerStyle={styles.searchBar}
						/>
					</View>
					<View style={styles.listBodyContent}>
						{isListLoading ? (
							Array.from({ length: 25 }).map((_, index) => (
								<View
									key={index}
									style={[
										styles.loadingLine,
										index % 4 === 0 && styles.loadingLineShort,
									]}
								/>
							))
						) : (
							<>
								{filterByCat && (
									<FilteredByCat
										count={data!.data.length}
										categories={categories!}
										filterByCat={filterByCat}
										setFilterByCat={setFilterByCat}
									/>
								)}

								{searchQuery ? (
									filteredData.length > 0 ? (
										filteredData.map((item, index) => {
											const locked = isMetierLocked(index);
											return (
												<TouchableOpacity
													key={index}
													onPress={() => handlePress(item.id, index)}>
													<Text
														style={[styles.listItem, locked && styles.lockedItem]}>
														{item.METIER}
													</Text>
												</TouchableOpacity>
											);
										})
									) : (
										<View style={styles.noDataContainer}>
											<Text style={styles.noDataText}>Aucun métier trouvé.</Text>
										</View>
									)
								) : (
									alphabet.map((letter) => (
										<View
											key={letter}
											ref={(el) => {
												sectionRefs[letter] = el;
											}}>
											<Text style={styles.listHeader}>{letter}</Text>
											{groupedData[letter]?.map((item, indexInGroup) => {
												const locked = isMetierLocked(indexInGroup);
												return (
													<TouchableOpacity
														key={indexInGroup}
														onPress={() =>
															handlePress(item.id, indexInGroup)
														}>
														<Text
															style={[
																styles.listItem,
																locked && styles.lockedItem,
															]}>
															{item.METIER}
														</Text>
													</TouchableOpacity>
												);
											})}
										</View>
									))
								)}
							</>
						)}
					</View>
				</ScrollView>

					{!isListLoading && !searchQuery && filteredData.length > 0 && (
						<View style={styles.sidebar}>
							{alphabet.map((letter, index) => (
								<TouchableOpacity
									key={index}
									hitSlop={SIDEBAR_HIT_SLOP}
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
		flex: 1,
		marginBottom: 80,
		position: "relative",
	},
	listWrapper: {
		flex: 1,
	},
	listContainer: {
		paddingBottom: 60,
	},
	listBodyContent: {
		paddingHorizontal: 5,
		paddingRight: 44,
	},
	listPageHeader: {
		paddingBottom: 8,
	},
	stickySearchContainer: {
		width: "100%",
		paddingTop: 8,
		paddingBottom: 6,
		backgroundColor: "transparent",
	},
	searchBar: {
		width: "100%",
		borderWidth: 2,
		borderColor: "#F5F5F5",
		backgroundColor: "#FFFFFF",
		shadowOpacity: 0,
		elevation: 0,
	},
	loadingLine: {
		height: 20,
		borderRadius: 10,
		backgroundColor: "#E4E4E4",
		marginBottom: 16,
		width: "100%",
	},
	loadingLineShort: {
		width: "70%",
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
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 0,
		width: 40,
		paddingTop: 36,
		justifyContent: "center",
		alignItems: "center",
	},
	sidebarText: {
		padding: 1,
		fontSize: FontSize12,
		fontWeight: "bold",
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

export default React.memo(MetierList);
