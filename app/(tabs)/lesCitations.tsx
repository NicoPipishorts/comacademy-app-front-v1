import QuoteClose from "@/assets/imgs/icons/quote_close.png";
import QuoteOpen from "@/assets/imgs/icons/quote_open.png";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize14, FontSize16, FontSize22 } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import useLesCitations from "@/hooks/useGetLesCitations";
import useJwtToken from "@/hooks/useJwtToken";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated"; // Optional for smooth animation
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LesCitations = () => {
	const { token } = useJwtToken();
	const { data, isLoading } = useLesCitations(token);
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef(null); // Ref for ScrollView
	const { isHomeButtonModel } = useDeviceTypeCheckers();
	const [isAtEnd, setIsAtEnd] = useState(false); // State to check if we're already at the end
	const scrollPosition = useRef(0); // Ref to track current scroll position

	// Function to scroll to the end of the ScrollView
	const scrollToEnd = () => {
		if (scrollViewRef.current) {
			scrollViewRef.current.scrollToEnd({ animated: true });
		}
	};

	useEffect(() => {
		// Scroll to the end only if we're not already at the end
		if (data && !isAtEnd) {
			scrollToEnd();
		}
	}, [data, isAtEnd]);

	// Check if we're already at the end during scrolling
	const handleScroll = (event) => {
		const contentWidth = event.nativeEvent.contentSize.width;
		const layoutWidth = event.nativeEvent.layoutMeasurement.width;
		const scrollX = event.nativeEvent.contentOffset.x;

		// If scrollX + layoutWidth === contentWidth, we're at the end
		const isScrollAtEnd = scrollX + layoutWidth >= contentWidth - 10; // Adding some buffer
		setIsAtEnd(isScrollAtEnd);
		scrollPosition.current = scrollX;
	};

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
				<ScreenHeaders content='Les Citations' />
			</View>
			<ScrollView
				ref={scrollViewRef}
				style={styles.citationsWrapper}
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				onContentSizeChange={scrollToEnd} // Ensure scroll happens after content size is calculated
				onScroll={handleScroll} // Track the scroll position
				scrollEventThrottle={16} // Improve scroll performance
				onLayout={scrollToEnd} // Ensure scroll happens after layout
			>
				<View style={styles.citationsContainer}>
					{reversedData.map((citation) => (
						<Animated.View
							key={citation.id}
							style={styles.cardWrapper}
							entering={FadeInUp.delay(100)} // Optional Reanimated transition
						>
							<View
								style={{
									paddingRight: 50,
									paddingBottom: 5,
									alignItems: "flex-end",
								}}>
								<Text style={{ fontSize: FontSize14, fontWeight: "bold" }}>
									{moment(citation.attributes.updatedAt).format("DD/MM/YYYY")}
								</Text>
							</View>
							<View style={styles.cardContainer}>
								<Image
									source={QuoteClose}
									style={{
										position: "absolute",
										bottom: 20,
										right: 20,
										width: 45,
										height: 45,
									}}
								/>
								<Image
									source={QuoteOpen}
									style={{
										position: "absolute",
										top: 20,
										left: 20,
										width: 45,
										height: 45,
									}}
								/>
								<View style={styles.cardContent}>
									<Text style={styles.cardTextCitation}>
										{citation.attributes.CITATION}
									</Text>
								</View>
								<View style={styles.containerTextAuteur}>
									<Text style={styles.cardTextAuteur}>
										{citation.attributes.AUTEUR}
									</Text>
								</View>
							</View>
						</Animated.View>
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
	cardWrapper: {
		maxHeight: 420,
	},
	cardContainer: {
		flex: 1,
		justifyContent: "center",
		maxWidth: 350,
		minHeight: 250,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		elevation: 5,
		backgroundColor: colorBlack,
		marginHorizontal: 20,
		borderRadius: 20,
		shadowColor: colorBlack,
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	cardContent: {
		padding: 20,
		borderRadius: 10,
	},
	cardTextCitation: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
	},
	containerTextAuteur: {
		width: "100%",
		justifyContent: "flex-start",
		paddingHorizontal: 20,
		paddingBottom: 15,
	},
	cardTextAuteur: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});

export default LesCitations;
