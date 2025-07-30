import CardLesCitations from "@/components/cards/CardLesCitations";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useLesCitations from "@/hooks/Citations/useGetLesCitations";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LesCitations = () => {
	const { citationCategory } = useLocalSearchParams();
	const { data, isLoading } = useLesCitations(citationCategory as string);
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef(null);

	useTrackPageMetrics({ page: "Citations" });

	if (isLoading) {
		return <Loader />;
	}
	if (!data) {
		return (
			<View style={styles.noDataContainer}>
				<Text>No data available</Text>
			</View>
		);
	}

	const citationsData = [...data.data.results.data];

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={{ paddingHorizontal: 30 }}>
				<ScreenHeaders content='Citations' />
				<Text style={styles.categoryTitle}>{data.data.cat}</Text>
			</View>
			<ScrollView
				ref={scrollViewRef}
				style={styles.citationsWrapper}
				horizontal={true}
				showsHorizontalScrollIndicator={false}>
				<View style={styles.citationsContainer}>
					{citationsData.map((citation) => (
						<CardLesCitations key={citation.id} citation={citation} />
					))}
				</View>
			</ScrollView>
		</View>
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
	cardBackgroundImage: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default LesCitations;
