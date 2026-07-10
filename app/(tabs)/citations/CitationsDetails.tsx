// src/app/(whatever)/LesCitations.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import ScreenHeaders from "@/components/ScreenHeaders";
import CardLesCitations from "@/components/cards/CardLesCitations";
import Loader from "@/components/experience/loader";
import ModalGestureLine from "@/components/experience/modalGestureLine";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import { primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { CitationFavoritesProvider } from "@/context/CitationFavoritesContext";
import useLesCitations from "@/hooks/Citations/useGetLesCitations";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import { CitationData } from "@/types/lesCitations";

// Layout constants
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 20;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
type CitationListItem = {
	type: "citation";
	id: string;
	citation: CitationData;
	locked: boolean;
};

const LesCitations = () => {
	const { citationCategory } = useLocalSearchParams();
	const category = (citationCategory as string) ?? "";
	const requestUrl = `${process.env.EXPO_PUBLIC_API_URL}/citations/by-category/${category}`;
	const { data, isLoading } = useLesCitations(category);
	const insets = useSafeAreaInsets();
	const listRef = useRef<FlatList>(null);
	const {
		isItemLocked,
		isFreeUser,
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
	} = useSubscriptionLimit({ freeLimit: 1 });

	useTrackPageMetrics({ page: "Citations" });

	// Peek animation on first load
	useEffect(() => {
		if (!isLoading && data) {
			const peek = SNAP_INTERVAL * 0.1;
			const overshoot = peek * 1.5;
			const t1 = setTimeout(() => {
				listRef.current?.scrollToOffset({ offset: overshoot, animated: true });
			}, 200);
			const t2 = setTimeout(() => {
				listRef.current?.scrollToOffset({ offset: 0, animated: true });
			}, 500);
			return () => {
				clearTimeout(t1);
				clearTimeout(t2);
			};
		}
		return undefined;
	}, [isLoading, data]);

	if (isLoading) return <Loader />;

	const rawResults = data?.data?.results;
	const citationsData = Array.isArray(rawResults)
		? rawResults
		: rawResults?.data ?? [];

	if (!data || citationsData.length === 0) {
		return (
			<View style={styles.noDataContainer}>
				<Text>No data available</Text>
				<Text style={styles.debugUrlLabel}>Last request:</Text>
				<Text style={styles.debugUrl}>{requestUrl}</Text>
			</View>
		);
	}

	// OPTIONAL: hook this up to your modal or navigation
	const handleAddToPlaylist = (citationId: number) => {
		// e.g., open modal or navigate
		// openAddToPlaylistModal({ type: "citation", elementId: citationId });
	};

	const listItems: CitationListItem[] = citationsData.map((citation, index) => ({
		type: "citation",
		id: `citation-${citation.id}`,
		citation,
		locked: isItemLocked(index),
	}));

	return (
		<CitationFavoritesProvider>
			<View style={[styles.wrapper]}>
				<ModalGestureLine style={styles.gestureLine} />
				<UpgradeSubscriptionModal
					visible={showUpgradeModal}
					onClose={closeUpgradeModal}
					message="Les citations complètes sont réservées aux membres premium. La première citation de chaque catégorie est accessible gratuitement."
				/>
				<View style={{ paddingHorizontal: 30, }}>
					<ScreenHeaders content='Citations' />
					<Text style={styles.categoryTitle}>{data.data.cat}</Text>
				</View>

				<View style={styles.listStage}>
					<FlatList
						ref={listRef}
						data={listItems}
						keyExtractor={(item) => item.id}
						horizontal
						contentContainerStyle={styles.listContent}
						renderItem={({ item }) => {
							const { citation, locked } = item;

							return (
								<View style={styles.citationItem}>
									<CardLesCitations
										citation={citation}
										onAddPress={handleAddToPlaylist}
										showFavorite={!locked}
										wrapperStyle={styles.citationCardWrapper}
										cardStyle={styles.citationCard}
										actionsRowStyle={styles.citationActionsRow}
										overlay={
											locked ? (
												<TouchableOpacity
													activeOpacity={1}
													onPress={handleLockedItemPress}
													style={styles.lockedOverlayButton}>
													<BlurView intensity={70} style={styles.lockedOverlay}>
														<View style={styles.lockedOverlayContent}>
															<Text style={styles.lockedOverlayTitle}>
																Contenu Premium
															</Text>
															<Text style={styles.lockedOverlayText}>
																Débloque le reste des citations de cette catégorie.
															</Text>
														</View>
													</BlurView>
												</TouchableOpacity>
											) : null
										}
									/>
								</View>
							);
						}}
						showsHorizontalScrollIndicator={false}
						snapToInterval={SNAP_INTERVAL}
						snapToAlignment='start'
						decelerationRate='fast'
						initialNumToRender={5}
						windowSize={5}
						removeClippedSubviews
					/>
				</View>
			</View>
		</CitationFavoritesProvider>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	debugUrlLabel: {
		marginTop: 16,
		fontSize: FontSize16,
		fontWeight: "600",
	},
	debugUrl: {
		textAlign: "center",
		marginTop: 4,
		paddingHorizontal: 20,
		fontSize: FontSize16,
	},
	categoryTitle: {
		marginTop: -10,
		fontSize: FontSize16,
		textTransform: "capitalize",
		fontWeight: "bold",
	},
	gestureLine: {
		marginVertical: 28,
	},
	listStage: {
		flex: 1,
	},
	listContent: {
		paddingLeft: SIDE_PADDING,
		paddingRight: SIDE_PADDING - CARD_SPACING,
		alignItems: "center",
	},
	citationItem: {
		width: CARD_WIDTH,
		marginRight: CARD_SPACING,
		alignItems: "center",
		justifyContent: "center",
	},
	citationCardWrapper: {
		width: CARD_WIDTH,
		alignSelf: "center",
	},
	citationCard: {
		width: CARD_WIDTH,
		alignSelf: "center",
	},
	citationActionsRow: {
		width: CARD_WIDTH,
		paddingRight: 6,
	},
	lockedOverlayButton: {
		flex: 1,
	},
	lockedOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	lockedOverlayContent: {
		paddingHorizontal: 28,
		alignItems: "center",
	},
	lockedOverlayTitle: {
		color: "#FFF",
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},
	lockedOverlayText: {
		color: "#FFF",
		fontSize: 15,
		lineHeight: 21,
		textAlign: "center",
	},
});

export default LesCitations;
