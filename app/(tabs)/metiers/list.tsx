import FilteredByCat from "@/components/filters/filteredByCat";
import {
	AlphabetSidebar,
	alphabeticalListStyles,
	LoadingLines,
	normalizeString,
} from "@/components/lists/alphabeticalList";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import Searchbar from "@/components/Searchbar";
import { colorBlack } from "@/constants/colors";
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

			<View style={alphabeticalListStyles.contentContainer}>
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
					style={alphabeticalListStyles.listWrapper}
					contentContainerStyle={alphabeticalListStyles.listContainer}
					stickyHeaderIndices={[1]}
					showsVerticalScrollIndicator={false}>
					<PageTitleAvatarHeader
						title={headerTitle}
						containerStyle={alphabeticalListStyles.listPageHeader}
					/>
					<View style={alphabeticalListStyles.stickySearchContainer}>
						<Searchbar
							placeholder='Rechercher'
							onChangeText={handleSearch}
							containerStyle={alphabeticalListStyles.searchBar}
						/>
					</View>
					<View style={alphabeticalListStyles.listBodyContent}>
						{isListLoading ? (
							<LoadingLines count={25} />
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
														style={[
															alphabeticalListStyles.listItem,
															locked && alphabeticalListStyles.lockedItem,
														]}>
														{item.METIER}
													</Text>
												</TouchableOpacity>
											);
										})
									) : (
										<View style={alphabeticalListStyles.noDataContainer}>
											<Text style={alphabeticalListStyles.noDataText}>
												Aucun métier trouvé.
											</Text>
										</View>
									)
								) : (
									alphabet.map((letter) => (
										<View
											key={letter}
											ref={(el) => {
												sectionRefs[letter] = el;
											}}>
											<Text style={alphabeticalListStyles.listHeader}>
												{letter}
											</Text>
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
																alphabeticalListStyles.listItem,
																locked && alphabeticalListStyles.lockedItem,
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
						<AlphabetSidebar
							letters={alphabet}
							onPressLetter={scrollToSection}
							style={styles.sidebar}
						/>
					)}
			</View>
		</>
	);
};

const styles = StyleSheet.create({
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
});

export default React.memo(MetierList);
