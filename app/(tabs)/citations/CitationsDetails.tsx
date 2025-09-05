// src/app/(whatever)/LesCitations.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenHeaders from "@/components/ScreenHeaders";
import CardLesCitations from "@/components/cards/CardLesCitations";
import Loader from "@/components/experience/loader";
import { primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { CitationFavoritesProvider } from "@/context/CitationFavoritesContext";
import useLesCitations from "@/hooks/Citations/useGetLesCitations";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";

const LesCitations = () => {
	const { citationCategory } = useLocalSearchParams();
	const { data, isLoading } = useLesCitations(citationCategory as string);
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);

	useTrackPageMetrics({ page: "Citations" });

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
		console.log("Add citation to playlist:", citationId);
	};

	return (
		<CitationFavoritesProvider>
			<View style={[styles.wrapper, { paddingTop: insets.top }]}>
				<View style={{ paddingHorizontal: 30 }}>
					<ScreenHeaders content='Citations' />
					<Text style={styles.categoryTitle}>{data.data.cat}</Text>
				</View>

				<FlatList
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
