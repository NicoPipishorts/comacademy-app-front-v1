import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetPetitesHistoires from "@/hooks/useGetPetitesHistoires";
import useJwtToken from "@/hooks/useJwtToken";
import { Video } from "expo-av";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LesPetitesHistoires = () => {
	const { token } = useJwtToken();
	const { data, isLoading } = useGetPetitesHistoires(token);
	const insets = useSafeAreaInsets();

	useTrackPageMetrics({ page: "PetiteHistoires" });

	// Get device width and calculate video height based on 9:16 aspect ratio for portrait video
	const { width } = Dimensions.get("window");
	const videoWidth = Math.floor(width * 0.8);
	const videoHeight = Math.floor((videoWidth / 9) * 16);

	const videoRefs = useRef({});
	const [focusedIndex, setFocusedIndex] = useState(null);

	// Reset the video to the start when it finishes
	const onPlaybackStatusUpdate = (status, index) => {
		if (status.didJustFinish) {
			if (videoRefs.current[index]) {
				videoRefs.current[index].setPositionAsync(0);
				videoRefs.current[index].pauseAsync();
			}
		}
	};

	// Handle viewable items changes
	const onViewableItemsChanged = useCallback(({ viewableItems }) => {
		const visibleIndex = viewableItems[0]?.index;

		// Pause videos leaving the view
		Object.keys(videoRefs.current).forEach((key) => {
			const ref = videoRefs.current[key];
			if (ref && key !== String(visibleIndex)) {
				ref.pauseAsync();
			}
		});

		// Play the video coming into view
		if (visibleIndex !== undefined && videoRefs.current[visibleIndex]) {
			videoRefs.current[visibleIndex].playAsync();
		}

		setFocusedIndex(visibleIndex);
	}, []);

	const viewabilityConfig = {
		itemVisiblePercentThreshold: 50, // Item must be at least 50% visible to be considered "focused"
	};

	if (isLoading) {
		// Full-screen loader when data is loading
		return (
			<View style={styles.loaderContainer}>
				<Loader />
			</View>
		);
	}

	if (!data) {
		return (
			<View style={styles.noDataContainer}>
				<Text>No data available</Text>
			</View>
		);
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={{ paddingHorizontal: 30 }}>
				<ScreenHeaders content='La petite histoire' />
			</View>

			<Animated.FlatList
				style={{ marginTop: 30, paddingHorizontal: 30 }}
				data={data.data}
				renderItem={({ item, index }) => {
					const videoUri = `${process.env.EXPO_PUBLIC_URL}${item.attributes.videoUri.data.attributes.url}`;

					return (
						<Animated.View
							key={item.id}
							style={[
								styles.cardWrapper,
								{ height: videoHeight, width: videoWidth },
							]}>
							<Video
								ref={(ref) => (videoRefs.current[index] = ref)} // Store the ref for each video
								source={{ uri: videoUri }} // Always provide a source
								style={{ width: videoWidth, height: videoHeight }}
								isMuted={false}
								isLooping={false}
								shouldPlay={focusedIndex === index} // Only play if it's in focus
								onPlaybackStatusUpdate={(status) =>
									onPlaybackStatusUpdate(status, index)
								}
								useNativeControls
							/>
						</Animated.View>
					);
				}}
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ paddingRight: 25 }}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				scrollEventThrottle={16}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#f0f0f0",
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	cardWrapper: {
		marginLeft: 10,
		marginRight: 24, // Increased space between videos
		borderRadius: 10,
		overflow: "hidden",
	},
});

export default LesPetitesHistoires;
