// src/app/(whatever)/LesCitations.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenHeaders from "@/components/ScreenHeaders";
import CardLesCitations from "@/components/cards/CardLesCitations";
import Loader from "@/components/experience/loader";
import ModalGestureLine from "@/components/experience/modalGestureLine";
import { primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { CitationFavoritesProvider } from "@/context/CitationFavoritesContext";
import useLesCitations from "@/hooks/Citations/useGetLesCitations";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";

// Layout constants
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 20;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

const LesCitations = () => {
	const { citationCategory } = useLocalSearchParams();
	const { data, isLoading } = useLesCitations(citationCategory as string);
	const insets = useSafeAreaInsets();
	const listRef = useRef<FlatList>(null);

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

	if (!data) {
		return (
			<View style={styles.noDataContainer}>
				<Text>No data available</Text>
			</View>
		);
	}

	const citationsData = [...data.data.results.data];

	// OPTIONAL: hook this up to your modal or navigation
	const handleAddToPlaylist = (citationId: number) => {
		// e.g., open modal or navigate
		// openAddToPlaylistModal({ type: "citation", elementId: citationId });
	};

	return (
		<CitationFavoritesProvider>
			<View style={[styles.wrapper, { paddingTop: 20 }]}>
				<ModalGestureLine />
				<View style={{ paddingHorizontal: 30 }}>
					<ScreenHeaders content='Citations' />
					<Text style={styles.categoryTitle}>{data.data.cat}</Text>
				</View>

				<FlatList
					ref={listRef}
					data={citationsData}
					keyExtractor={(item) => String(item.id)}
					horizontal
					renderItem={({ item }) => (
						<CardLesCitations
							citation={item}
							onAddPress={handleAddToPlaylist}
						/>
					)}
					showsHorizontalScrollIndicator={false}
					initialNumToRender={5}
					windowSize={5}
					removeClippedSubviews
				/>
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
	categoryTitle: {
		marginTop: -10,
		fontSize: FontSize16,
		textTransform: "capitalize",
		fontWeight: "bold",
	},
	citationsWrapper: {
		flexGrow: 0,
		height: "80%",
	},
	citationsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		minWidth: "100%",
		marginBottom: 40,
	},
});

export default LesCitations;
