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
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type Props = {
	data: DicoLists | null;
	categories: CategoriePayload | null;
	filterByCat: number | null;
	setFilterByCat: Dispatch<SetStateAction<number | null>>;
	headerTitle: string;
	onPressTitle?: () => void;
	isLoading: boolean;
	refreshing?: boolean;
	onRefresh?: () => void;
};

const DicoList = ({
	data,
	categories,
	filterByCat,
	setFilterByCat,
	headerTitle,
	onPressTitle,
	isLoading,
	refreshing = false,
	onRefresh,
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
		if (!isLoading && data && categories) {
			const MINIMUM_LOADING_TIME = 1500; // ms
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
			const mappedData = data.data
				.map((item) => ({
					id: item.id,
					Word: item.Word,
				}))
				.filter((item) => item.Word && item.Word !== "-")
				.sort((a, b) => a.Word.localeCompare(b.Word));
			const grouped = groupDataByFirstLetter(mappedData, "Word");
			setGroupedData(grouped);
			setFilteredData(mappedData);
		} else {
			setGroupedData({});
			setFilteredData([]);
		}
	}, [data]);

	const alphabet = Object.keys(groupedData)
		.sort()
		.filter((letter) => letter !== "#");
	alphabet.push("#");

	function groupDataByFirstLetter(
		items: DicoSelected[],
		property: keyof DicoSelected,
	) {
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
						Word: item.Word,
					}))
					.filter(
						(item) =>
							item.Word &&
							item.Word.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "")
								.toLowerCase()
								.includes(normalizedQuery),
					)
					.sort((a, b) => a.Word.localeCompare(b.Word));

				setFilteredData(filteredResults as DicoSelected[]);
			} else {
				setFilteredData(
					data.data
						.map((item) => ({
							id: item.id,
							Word: item.Word,
						}))
						.sort((a, b) => a.Word.localeCompare(b.Word)),
				);
			}
		},
		[data],
	);

	const handlePress = (id: number, index: number) => {
		if (isItemLocked(index)) {
			handleLockedItemPress();
			return;
		}
		navigation.navigate("dicoDetails", { id });
	};

	const isListLoading = showSkeleton || isLoading || !data || !categories;

	return (
		<>
			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message="Les 10 premiers mots du dictionnaire sont gratuits. Passez à un abonnement premium pour accéder à l'intégralité du dictionnaire."
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
						onPressTitle={onPressTitle}
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
							<LoadingLines count={15} />
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
								{searchQuery
									? filteredData.map((item, index) => {
											const locked = isItemLocked(index);
											return (
												<TouchableOpacity
													key={index}
													onPress={() => handlePress(item.id, index)}>
													<Text
														style={[
															alphabeticalListStyles.listItem,
															locked && alphabeticalListStyles.lockedItem,
														]}>
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
													<Text style={alphabeticalListStyles.listHeader}>
														{letter}
													</Text>
													{groupedData[letter]?.map((item, localIndex) => {
														const currentIndex = globalIndex++;
														const locked = isItemLocked(currentIndex);
														return (
															<TouchableOpacity
																key={localIndex}
																onPress={() =>
																	handlePress(item.id, currentIndex)
																}>
																<Text
																	style={[
																		alphabeticalListStyles.listItem,
																		locked && alphabeticalListStyles.lockedItem,
																	]}>
																	{item.Word}
																</Text>
															</TouchableOpacity>
														);
													})}
												</View>
											));
										})()}
								{searchQuery && filteredData.length === 0 && (
									<View style={alphabeticalListStyles.noDataContainer}>
										<Text style={alphabeticalListStyles.noDataText}>
											Aucun résultat trouvé.
										</Text>
									</View>
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
		top: 202,
		bottom: 0,
		width: 40,
		justifyContent: "flex-start",
		alignItems: "center",
	},
});

export default React.memo(DicoList);
