import PlayButton from "@/assets/imgs/BigPlayButton.png";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorWhite, primaryBackground } from "@/constants/colors";
import { FontSizeH1 } from "@/constants/fontsizes";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetPetitesHistoires from "@/hooks/useGetPetitesHistoires";
import useJwtToken from "@/hooks/useJwtToken";
import { Video } from "expo-av"; // Import the Video component from expo-av
import React, { useCallback, useRef, useState } from "react";
import {
	Animated,
	Dimensions,
	Image,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LesPetitesHistoires = () => {
	const { token } = useJwtToken();
	const { data, isLoading } = useGetPetitesHistoires(token);
	const insets = useSafeAreaInsets();

	useTrackPageMetrics({ page: "PetiteHistoires" });

	// Get device width and calculate video height based on 9:16 aspect ratio for portrait video
	const { width } = Dimensions.get("window"); // Get the full width of the device
	const videoWidth = Math.floor(width * 0.8); // Calculate 80% of the device's width
	const videoHeight = Math.floor((videoWidth / 9) * 16); // Adjust height based on 9:16 aspect ratio

	// Store the playing state for each video
	const [playingState, setPlayingState] = useState({});

	// Store individual video refs
	const videoRefs = useRef({});

	// Store the current index
	const [, setCurrentIndex] = useState(0);

	// Add a ref to the FlatList to control scrolling
	const flatListRef = useRef(null);

	// Track the currently in-focus item
	const [, setFocusedIndex] = useState(null);

	// Animation values for smooth transition
	const scrollX = useRef(new Animated.Value(0)).current;

	// Toggle playing state for each video
	const togglePlaying = (id) => {
		setPlayingState((prev) => ({
			...prev,
			[id]: !prev[id],
		}));

		// Control playback based on the current playing state
		if (videoRefs.current[id]) {
			if (playingState[id]) {
				videoRefs.current[id].pauseAsync();
			} else {
				videoRefs.current[id].playAsync();
			}
		}
	};

	// Handle playback status update to detect when video is finished
	const onPlaybackStatusUpdate = (status, index) => {
		if (status.didJustFinish && !status.isLooping) {
			moveToNextVideo(index);
		}
	};

	// Move to the next video in the list and scroll the FlatList
	const moveToNextVideo = (index) => {
		const nextIndex = index + 1;

		// Stop if we are at the last video
		if (nextIndex >= data.data.length) {
			return;
		}

		// Set the next video as playing
		setCurrentIndex(nextIndex);
		togglePlaying(data.data[nextIndex].id);

		// Scroll the FlatList to the next video
		if (flatListRef.current) {
			flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
		}
	};

	// Handle viewable items changed to detect which item is in focus
	const onViewableItemsChanged = useCallback(({ viewableItems }) => {
		if (viewableItems && viewableItems.length > 0) {
			setFocusedIndex(viewableItems[0].index); // Track the first visible item
		}
	}, []);

	// Configuration for viewable items tracking
	const viewabilityConfig = {
		itemVisiblePercentThreshold: 50, // Item must be at least 50% visible to be considered "focused"
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

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={{ paddingHorizontal: 30 }}>
				<ScreenHeaders content='La petites histoires' />
			</View>

			<Animated.FlatList
				ref={flatListRef} // Add ref to the FlatList
				style={{ marginTop: 30, paddingHorizontal: 30, marginRight: 10 }}
				data={data.data}
				renderItem={({ item, index }) => {
					const videoUri = `${process.env.EXPO_PUBLIC_URL}${item.attributes.videoUri.data.attributes.url}`;
					const isPlaying = playingState[item.id]; // Get the playing state for this specific video

					// Calculate the scale and opacity based on scroll position
					const inputRange = [
						(index - 1) * videoWidth,
						index * videoWidth,
						(index + 1) * videoWidth,
					];
					const scale = scrollX.interpolate({
						inputRange,
						outputRange: [0.9, 1, 0.9], // Scale focused item to 1, others to 0.9
						extrapolate: "clamp",
					});
					const opacity = scrollX.interpolate({
						inputRange,
						outputRange: [0.7, 1, 0.7], // Focused item full opacity, others reduced
						extrapolate: "clamp",
					});

					return (
						<Animated.View
							key={item.id}
							style={[
								styles.cardWrapper,
								{ height: videoHeight, width: videoWidth },
								{ transform: [{ scale }], opacity }, // Apply the animated scale and opacity
							]}>
							<Video
								ref={(ref) => (videoRefs.current[item.id] = ref)} // Store the ref for each video
								source={{ uri: videoUri }} // Use the URI from the data
								style={{ width: videoWidth, height: videoHeight }}
								isMuted={false}
								isLooping={false} // Disable looping
								useNativeControls={isPlaying ? true : false} // Show media controls (play, pause, etc.)
								onPlaybackStatusUpdate={(status) =>
									onPlaybackStatusUpdate(status, index)
								}
							/>
							{!isPlaying && (
								<View style={styles.playButtonContainer}>
									<Pressable
										style={[styles.playButton]}
										onPress={() => togglePlaying(item.id)}>
										<Image
											source={PlayButton}
											resizeMode='contain'
											style={styles.playButton}
										/>
									</Pressable>
								</View>
							)}
						</Animated.View>
					);
				}}
				horizontal={true}
				showsHorizontalScrollIndicator={false} // Hide the scroll indicator
				keyExtractor={(item) => item.id.toString()} // Ensure a unique key for each item
				contentContainerStyle={{ paddingRight: 25 }}
				onScroll={Animated.event(
					[{ nativeEvent: { contentOffset: { x: scrollX } } }],
					{ useNativeDriver: true } // Use native driver for better performance
				)}
				onViewableItemsChanged={onViewableItemsChanged} // Track the focused item
				viewabilityConfig={viewabilityConfig} // Set the visibility threshold
				scrollEventThrottle={16} // Ensure smooth scrolling updates
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#f0f0f0",
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	cardWrapper: {
		marginRight: 16,
		borderRadius: 10,
		overflow: "hidden",
	},
	playButtonContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	playButton: {
		justifyContent: "center",
		alignItems: "center",
		width: 160,
		height: 160,
		borderRadius: 100,
		backgroundColor: primaryBackground,
	},
	playText: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		color: colorWhite,
	},
});

export default LesPetitesHistoires;
