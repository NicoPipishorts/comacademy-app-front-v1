// File: src/components/leJeu/LesPetitesHistoires.tsx
import SplashScreen from "@/assets/imgs/spalshSceens/petiteHistoire.png";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetMediaList from "@/hooks/useGetMediaList";
import useJwtToken from "@/hooks/useJwtToken";
import { Video } from "expo-av";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
	Animated,
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TrenteSecondes = () => {
	const { token } = useJwtToken();
	const { data, isLoading } = useGetMediaList("trentes-secondes", token);
	const insets = useSafeAreaInsets();

	useTrackPageMetrics({ page: "TrenteSecondes" });

	// Compute dimensions for videos
	const { width } = Dimensions.get("window");
	const videoWidth = Math.floor(width * 0.8);
	const videoHeight = Math.floor((videoWidth / 9) * 16);

	// Refs for controlling videos and fade animations
	const videoRefs = useRef<Record<number, any>>({});
	const videoPositions = useRef<Record<number, number>>({});
	const fadeAnim = useRef<Record<number, Animated.Value>>({}).current;
	const focusedIndexRef = useRef(0);

	// State to trigger rerenders
	const [focusedIndex, setFocusedIndex] = useState(0);
	const [isFirstRender, setIsFirstRender] = useState(true);

	// When viewable item changes, pause previous video, save position, fade overlay
	const onViewableItemsChanged = useCallback(
		async ({ viewableItems }: { viewableItems: { index?: number }[] }) => {
			const newIndex = viewableItems[0]?.index;
			if (newIndex !== undefined && newIndex !== focusedIndex) {
				const prev = focusedIndex;

				// Pause previous video and save its position
				const prevRef = videoRefs.current[prev];
				if (prevRef) {
					const status = await prevRef.getStatusAsync();
					if (status.isLoaded) {
						videoPositions.current[prev] = status.positionMillis;
						prevRef.pauseAsync();
					}
				}

				// Fade in the splash on previous
				const prevAnim = fadeAnim[prev];
				if (prevAnim) {
					Animated.timing(prevAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}).start();
				}

				// Switch focus
				focusedIndexRef.current = newIndex;
				setFocusedIndex(newIndex);
				setIsFirstRender(false);

				// Initialize fadeAnim for new index if needed
				if (!fadeAnim[newIndex]) {
					fadeAnim[newIndex] = new Animated.Value(isFirstRender ? 0 : 1);
				}
				// Fade out splash on new
				Animated.timing(fadeAnim[newIndex], {
					toValue: 0,
					duration: 400,
					useNativeDriver: true,
				}).start();
			}
		},
		[fadeAnim, focusedIndex, isFirstRender]
	);

	const viewabilityConfig = useMemo(
		() => ({
			itemVisiblePercentThreshold: 70,
		}),
		[]
	);

	// Reverse the list so the newest appears first
	const reversedStories = useMemo(
		() => (data?.data ? [...data.data].reverse() : []),
		[data]
	);

	console.log(reversedStories);

	// Render each item
	const renderItem = useCallback(
		({ item, index }: { item: any; index: number }) => {
			const videoUri = item.attributes.videoUri;
			const isFocused = focusedIndexRef.current === index;

			if (!fadeAnim[index]) {
				fadeAnim[index] = new Animated.Value(
					isFirstRender && index === 0 ? 0 : 1
				);
			}

			return (
				<Animated.View
					key={item.id}
					style={[
						styles.cardWrapper,
						{ width: videoWidth, height: videoHeight },
					]}>
					<View style={styles.videoContainer}>
						<Video
							ref={(ref) => (videoRefs.current[index] = ref)}
							source={{ uri: videoUri }}
							style={styles.video}
							isMuted={false}
							isLooping={false}
							shouldPlay={isFocused}
							positionMillis={videoPositions.current[index] || 0}
							useNativeControls
						/>

						{!isFocused && (
							<Animated.View
								style={[
									StyleSheet.absoluteFillObject,
									styles.overlayContainer,
									{ opacity: fadeAnim[index] },
								]}>
								<Image
									source={SplashScreen}
									style={styles.thumbnail}
									resizeMode='cover'
								/>
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => setFocusedIndex(index)}
									style={styles.playButtonContainer}>
									<Text style={styles.playIcon}>▶</Text>
								</TouchableOpacity>
							</Animated.View>
						)}
					</View>
				</Animated.View>
			);
		},
		[fadeAnim, isFirstRender, videoHeight, videoWidth]
	);

	if (isLoading) {
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
			<View style={styles.headerPadding}>
				<ScreenHeaders content='30s top chrono' />
			</View>

			<Animated.FlatList
				style={styles.list}
				data={reversedStories}
				renderItem={renderItem}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.contentPadding}
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
	headerPadding: {
		paddingHorizontal: 30,
	},
	list: {
		marginTop: 30,
		paddingHorizontal: 30,
	},
	contentPadding: {
		paddingRight: 25,
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
		marginRight: 24,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "#000",
	},
	videoContainer: {
		position: "relative",
		width: "100%",
		height: "100%",
	},
	video: {
		width: "100%",
		height: "100%",
	},
	overlayContainer: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	thumbnail: {
		width: "100%",
		height: "100%",
	},
	playButtonContainer: {
		position: "absolute",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	playIcon: {
		color: "#FFF",
		fontSize: 30,
	},
});

export default TrenteSecondes;
