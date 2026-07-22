// File: src/components/leJeu/TopDesFlops.tsx
import { useFocusEffect, useIsFocused } from "expo-router";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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

import SplashScreen from "@/assets/imgs/spalshSceens/petiteHistoire.png";
import LockedVideoOverlay from "@/components/experience/LockedVideoOverlay";
import ExpoVideo, { ManagedVideoHandle } from "@/components/media/ExpoVideo";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { usePlaybackReset } from "@/helpers/videoCrontrolsReset";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useTrackRubricOpened } from "@/hooks/Rubrics/useRubricNotifications";
import useGetMediaList from "@/hooks/useGetMediaList";
import useJwtToken from "@/hooks/useJwtToken";
import { useMinimumLoadingTime } from "@/hooks/useMinimumLoadingTime";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import PetitesHistoiresSkeleton from "./petitesHistoiresSkeleton";

type StoryItem = {
	id: number | string;
	videoUri?: {
		url?: string;
	};
};

const ensureFadeValue = (
	fadeMap: Record<number, Animated.Value>,
	index: number,
) => {
	if (!fadeMap[index]) {
		fadeMap[index] = new Animated.Value(1);
	}
	return fadeMap[index];
};

const TopDesFlops: React.FC = () => {
	useTrackRubricOpened("top-des-flops");
	const { token } = useJwtToken();
	const routeKey = "top-des-flops";
	const { data, isLoading, isFetching } = useGetMediaList(routeKey, token);
	const insets = useSafeAreaInsets();
	const isScreenFocused = useIsFocused();

	useTrackPageMetrics({ page: "TopDesFlops" });

	const {
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
		isFreeUser,
	} = useSubscriptionLimit({ freeLimit: 5 });

	// Compute dimensions for videos
	const { width } = Dimensions.get("window");
	const videoWidth = Math.floor(width * 0.8);
	const videoHeight = Math.floor((videoWidth / 9) * 16);

	// Refs for controlling videos and fade animations
	const videoRefs = useRef<Record<number, ManagedVideoHandle | null>>({});
	const videoPositions = useRef<Record<number, number>>({});
	const fadeAnim = useRef<Record<number, Animated.Value>>({}).current;
	const focusedIndexRef = useRef(0);

	// State to trigger rerenders
	const [focusedIndex, setFocusedIndex] = useState(0);

	const handlePlaybackStatus = usePlaybackReset(
		videoRefs,
		videoPositions,
		setFocusedIndex,
	);

	// Helper: pause all videos when screen blurs or unmounts
	const pauseAllVideos = useCallback(async () => {
		const refs = Object.values(videoRefs.current);
		await Promise.all(
			refs.map(async (ref) => {
				if (ref) {
					try {
						const status = await ref.getStatusAsync();
						if (status.isLoaded && status.isPlaying) {
							await ref.pauseAsync();
						}
					} catch {
						// ignore
					}
				}
			})
		);
	}, []);

	// Pause on blur/unmount
	useFocusEffect(
		useCallback(() => {
			return () => {
				pauseAllVideos();
			};
		}, [pauseAllVideos]),
	);

	// When viewable item changes, pause previous video, save position, fade overlay
	const onViewableItemsChanged = useCallback(
		async ({ viewableItems }: { viewableItems: { index?: number }[] }) => {
			const newIndex = viewableItems[0]?.index;
			if (newIndex !== undefined && newIndex !== focusedIndexRef.current) {
				const prevIndex = focusedIndexRef.current;

				// 1) Pause previous video and save its position
				const prevRef = videoRefs.current[prevIndex];
				if (prevRef) {
					const status = await prevRef.getStatusAsync();
					if (status.isLoaded) {
						videoPositions.current[prevIndex] = status.positionMillis;
						await prevRef.pauseAsync();
					}
				}

				// 2) Fade in splash on previous
				const prevAnim = fadeAnim[prevIndex];
				if (prevAnim) {
					Animated.timing(prevAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}).start();
				}

				// 3) Switch focus
				focusedIndexRef.current = newIndex;
				setFocusedIndex(newIndex);

				// 4) Init fadeAnim for new index if needed
				ensureFadeValue(fadeAnim, newIndex).setValue(1);
				// Note: Don't auto-fade out - user needs to press play button
			}
		},
		[fadeAnim],
	);

	const viewabilityConfig = useMemo(
		() => ({
			itemVisiblePercentThreshold: 70,
		}),
		[]
	);

	// Reverse the list so the newest appears first
	const reversedStories = useMemo<StoryItem[]>(
		() => (data?.data ? [...data.data].reverse() : []),
		[data],
	);
	const hasStories = reversedStories.length > 0;

	const isActuallyLoading =
		(!data || !hasStories) && (isLoading || isFetching);

	const showSkeleton = useMinimumLoadingTime({
		isLoading: isActuallyLoading,
		minimumLoadingTime: 1000,
	});

	// Initialize first video without autoplay; pause all on unmount
	useEffect(() => {
		if (isLoading) return;
		if (!hasStories) return;

		const initialIndex = 0;

		// Sync state and refs
		focusedIndexRef.current = initialIndex;
		setFocusedIndex(initialIndex);

		// Ensure overlay for first item starts visible (opacity 1)
		ensureFadeValue(fadeAnim, initialIndex).setValue(1);

		// Pause all on unmount
		return () => {
			pauseAllVideos();
		};
	}, [isLoading, hasStories, pauseAllVideos, fadeAnim]);

	// Handler for when user presses play button
	const handleFocusPress = useCallback(
		(index: number) => {
			focusedIndexRef.current = index;
			setFocusedIndex(index);

			// Fade out overlay
			const overlayOpacity = ensureFadeValue(fadeAnim, index);
			Animated.timing(overlayOpacity, {
				toValue: 0,
				duration: 400,
				useNativeDriver: true,
			}).start();

			// Play the video
			const ref = videoRefs.current[index];
			if (ref) {
				ref.playAsync().catch(() => {});
			}
		},
		[fadeAnim]
	);

	// Render each item
	const renderItem = useCallback(
		({ item, index }: { item: StoryItem; index: number }) => {
			const videoUri = item.videoUri?.url;
			const isFocused = focusedIndex === index;
			const isLocked = isFreeUser && index >= 5;
			const overlayOpacity = ensureFadeValue(fadeAnim, index);

			return (
				<Animated.View
					key={item.id}
					style={[
						styles.cardWrapper,
						{ width: videoWidth, height: videoHeight },
					]}>
					<View style={styles.videoContainer}>
						<ExpoVideo
							ref={(ref: ManagedVideoHandle | null) => {
								videoRefs.current[index] = ref;
							}}
							source={{ uri: videoUri }}
							style={styles.video}
							isMuted={false}
							isLooping={false}
							shouldPlay={false} // never auto-play on focus
							positionMillis={videoPositions.current[index] || 0}
							useNativeControls={!isLocked}
							resizeMode='cover'
							onPlaybackStatusUpdate={(status) =>
								handlePlaybackStatus(status, index)
							}
							isScreenFocused={isScreenFocused && isFocused}
						/>

						{!isFocused && (
							<Animated.View
								style={[
									StyleSheet.absoluteFillObject,
									styles.overlayContainer,
									{ opacity: overlayOpacity },
								]}>
								<Image
									source={SplashScreen}
									style={styles.thumbnail}
									resizeMode='cover'
								/>
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => handleFocusPress(index)}
									style={styles.playButtonContainer}>
									<Text style={styles.playIcon}>▶</Text>
								</TouchableOpacity>
							</Animated.View>
						)}

						{isLocked && (
							<View style={[StyleSheet.absoluteFillObject]}>
								<LockedVideoOverlay onUpgradePress={handleLockedItemPress} />
							</View>
						)}
					</View>
				</Animated.View>
			);
		},
		[
			fadeAnim,
			handlePlaybackStatus,
			focusedIndex,
			videoHeight,
			videoWidth,
			isFreeUser,
			handleLockedItemPress,
			isScreenFocused,
			handleFocusPress,
		],
	);

	const showEmptyState = !showSkeleton && data && !hasStories;
	const showStories = !showSkeleton && data && hasStories;

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='Le top des flops'
				showAvatar={false}
				containerStyle={styles.headerPadding}
			/>

			{showSkeleton && <PetitesHistoiresSkeleton />}

			{showEmptyState && (
				<View style={styles.noDataContainer}>
					<Text style={styles.noDataText}>Aucune vidéo disponible pour le moment</Text>
				</View>
			)}

			{showStories && (
				<>
					<UpgradeSubscriptionModal
						visible={showUpgradeModal}
						onClose={closeUpgradeModal}
					/>

					<Animated.FlatList
						style={styles.list}
						data={reversedStories}
						key={routeKey}
						keyExtractor={(item) => `${routeKey}-${item.id}`}
						renderItem={renderItem}
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.contentPadding}
						onViewableItemsChanged={onViewableItemsChanged}
						viewabilityConfig={viewabilityConfig}
						scrollEventThrottle={16}
						snapToInterval={videoWidth + 34}
						snapToAlignment='start'
						decelerationRate='fast'
						pagingEnabled={false}
						windowSize={3}
						maxToRenderPerBatch={2}
						removeClippedSubviews={true}
						initialNumToRender={1}
					/>
				</>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#F5F5F5",
	},
	headerPadding: {
		paddingHorizontal: 30,
	},
	list: {
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
		paddingHorizontal: 40,
	},
	noDataText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
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

export default TopDesFlops;
