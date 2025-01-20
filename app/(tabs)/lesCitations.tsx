import CardLesCitations from "@/components/cards/CardLesCitations";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useLesCitations from "@/hooks/useGetLesCitations";
import useJwtToken from "@/hooks/useJwtToken";
import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LesCitations = () => {
	const { token } = useJwtToken();
	const { data, isLoading } = useLesCitations(token);
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef(null); // Ref for ScrollView

	useTrackPageMetrics({ page: "Citations" });

	// Function to scroll to the end of the ScrollView (immediately)
	const scrollToEnd = () => {
		if (scrollViewRef.current) {
			scrollViewRef.current.scrollToEnd({ animated: false }); // No animation
		}
	};

	useEffect(() => {
		// Scroll to the end when data is available or updated
		if (data) {
			scrollToEnd();
		}
	}, [data]);

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

	// Reverse the data so the oldest appears last (right side)
	const reversedData = [...data.data].reverse();

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={{ paddingHorizontal: 30 }}>
				<ScreenHeaders content='Citations' />
			</View>
			<ScrollView
				ref={scrollViewRef}
				style={styles.citationsWrapper}
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				onContentSizeChange={scrollToEnd} // Ensure scroll happens after content size is calculated
				onLayout={scrollToEnd} // Ensure scroll happens after layout
			>
				<View style={styles.citationsContainer}>
					{reversedData.map((citation) => (
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
