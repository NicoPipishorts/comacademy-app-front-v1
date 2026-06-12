import { useFocusEffect, useIsFocused } from "@react-navigation/native";
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
import PetitesHistoiresSkeleton from "@/app/(tabs)/petitesHistoiresSkeleton";
import ExpoVideo, { ManagedVideoHandle } from "@/components/media/ExpoVideo";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { primaryBackground } from "@/constants/colors";
import { usePlaybackReset } from "@/helpers/videoCrontrolsReset";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useTrackRubricOpened } from "@/hooks/Rubrics/useRubricNotifications";
import useGetMediaList, { MediaItem } from "@/hooks/useGetMediaList";
import useJwtToken from "@/hooks/useJwtToken";
import { useMinimumLoadingTime } from "@/hooks/useMinimumLoadingTime";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import { resolveMediaUrl } from "@/src/utils/resolveMediaUrl";

const routeKey = "capsules" as const;

const ensureFadeValue = (
	fadeMap: Record<number, Animated.Value>,
	index: number,
) => {
	if (!fadeMap[index]) {
		fadeMap[index] = new Animated.Value(1);
	}
	return fadeMap[index];
};

const resolveVideoUri = (item: MediaItem): string | undefined => {
	const directUrl = item?.videoUri?.url;
	const nestedUrl = item?.attributes?.videoUri?.data?.attributes?.url;
	const directLink = item?.videoLink ?? undefined;
	const nestedLink = item?.attributes?.videoLink ?? undefined;
	return directUrl ?? nestedUrl ?? directLink ?? nestedLink ?? undefined;
};

const resolveCoverUri = (item: MediaItem): string => {
	const mediaCandidate =
		item.coverPhoto?.formats?.large?.url ??
		item.coverPhoto?.formats?.medium?.url ??
		item.coverPhoto?.formats?.small?.url ??
		item.coverPhoto?.formats?.thumbnail?.url ??
		item.coverPhoto?.url;

	return resolveMediaUrl(mediaCandidate, undefined) ?? "";
};

export default function Capsules() {
	useTrackRubricOpened("secrets");
	const { token } = useJwtToken();
	const { data, isLoading, isFetching } = useGetMediaList(routeKey, token);
	const insets = useSafeAreaInsets();
	const isScreenFocused = useIsFocused();

	useTrackPageMetrics({ page: "Capsules" });

	const {
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
		isFreeUser,
	} = useSubscriptionLimit({ freeLimit: 5 });

	const { width } = Dimensions.get("window");
	const videoWidth = Math.floor(width * 0.8);
	const videoHeight = Math.floor((videoWidth / 9) * 16);

	const videoRefs = useRef<Record<number, ManagedVideoHandle | null>>({});
	const videoPositions = useRef<Record<number, number>>({});
	const fadeAnim = useRef<Record<number, Animated.Value>>({}).current;
	const focusedIndexRef = useRef(0);
	const [focusedIndex, setFocusedIndex] = useState(0);

	const handlePlaybackStatus = usePlaybackReset(
		videoRefs,
		videoPositions,
		setFocusedIndex,
	);

	const pauseAllVideos = useCallback(async () => {
		const refs = Object.values(videoRefs.current);
		await Promise.all(
			refs.map(async (ref) => {
				if (!ref) return;
				try {
					const status = await ref.getStatusAsync();
					if (status.isLoaded && status.isPlaying) {
						await ref.pauseAsync();
					}
				} catch {
					// ignore playback cleanup errors
				}
			}),
		);
	}, []);

	useFocusEffect(
		useCallback(() => {
			return () => {
				pauseAllVideos();
			};
		}, [pauseAllVideos]),
	);

	useEffect(() => {
		if (!isScreenFocused) {
			pauseAllVideos();
		}
	}, [isScreenFocused, pauseAllVideos]);

	const onViewableItemsChanged = useCallback(
		async ({ viewableItems }: { viewableItems: { index?: number }[] }) => {
			const newIndex = viewableItems[0]?.index;
			if (newIndex === undefined || newIndex === focusedIndexRef.current) return;

			const prevIndex = focusedIndexRef.current;
			const prevRef = videoRefs.current[prevIndex];
			if (prevRef) {
				const status = await prevRef.getStatusAsync();
				if (status.isLoaded) {
					videoPositions.current[prevIndex] = status.positionMillis;
					await prevRef.pauseAsync();
				}
			}

			const prevAnim = fadeAnim[prevIndex];
			if (prevAnim) {
				Animated.timing(prevAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}).start();
			}

			focusedIndexRef.current = newIndex;
			setFocusedIndex(newIndex);
			ensureFadeValue(fadeAnim, newIndex).setValue(1);
		},
		[fadeAnim],
	);

	const viewabilityConfig = useMemo(
		() => ({
			itemVisiblePercentThreshold: 70,
		}),
		[],
	);

	const capsules = useMemo<MediaItem[]>(
		() => (data?.data ? [...data.data] : []),
		[data],
	);
	const hasCapsules = capsules.length > 0;
	const isActuallyLoading =
		(!data || !hasCapsules) && (isLoading || isFetching);
	const showSkeleton = useMinimumLoadingTime({
		isLoading: isActuallyLoading,
		minimumLoadingTime: 1000,
	});

	useEffect(() => {
		if (isLoading || !hasCapsules) return;

		focusedIndexRef.current = 0;
		setFocusedIndex(0);
		ensureFadeValue(fadeAnim, 0).setValue(1);

		return () => {
			pauseAllVideos();
		};
	}, [isLoading, hasCapsules, pauseAllVideos, fadeAnim]);

	const handleFocusPress = useCallback(
		(index: number) => {
			focusedIndexRef.current = index;
			setFocusedIndex(index);

			const overlayOpacity = ensureFadeValue(fadeAnim, index);
			Animated.timing(overlayOpacity, {
				toValue: 0,
				duration: 400,
				useNativeDriver: true,
			}).start();

			videoRefs.current[index]?.playAsync().catch(() => {});
		},
		[fadeAnim],
	);

	const renderItem = useCallback(
		({ item, index }: { item: MediaItem; index: number }) => {
			const videoUri = resolveVideoUri(item);
			const coverUri = resolveCoverUri(item);
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
						{videoUri ? (
							<ExpoVideo
								ref={(ref: ManagedVideoHandle | null) => {
									videoRefs.current[index] = ref;
								}}
								source={{ uri: videoUri }}
								style={styles.video}
								isMuted={false}
								isLooping={false}
								shouldPlay={false}
								positionMillis={videoPositions.current[index] || 0}
								useNativeControls={!isLocked}
								resizeMode='cover'
								onPlaybackStatusUpdate={(status) =>
									handlePlaybackStatus(status, index)
								}
								isScreenFocused={isScreenFocused && isFocused}
							/>
						) : (
							<View style={styles.missingVideo}>
								<Text style={styles.missingVideoText}>Vidéo indisponible</Text>
							</View>
						)}

						{!isFocused && (
							<Animated.View
								style={[
									StyleSheet.absoluteFillObject,
									styles.overlayContainer,
									{ opacity: overlayOpacity },
								]}>
								{coverUri ? (
									<Image
										source={{ uri: coverUri }}
										style={styles.thumbnail}
										resizeMode='cover'
									/>
								) : (
									<Image
										source={SplashScreen}
										style={styles.thumbnail}
										resizeMode='cover'
									/>
								)}
								<TouchableOpacity
									activeOpacity={0.8}
									disabled={!videoUri}
									onPress={() => handleFocusPress(index)}
									style={styles.playButtonContainer}>
									<Text style={styles.playIcon}>▶</Text>
								</TouchableOpacity>
							</Animated.View>
						)}

						{isLocked && (
							<View style={StyleSheet.absoluteFillObject}>
								<LockedVideoOverlay onUpgradePress={handleLockedItemPress} />
							</View>
						)}
					</View>
				</Animated.View>
			);
		},
		[
			fadeAnim,
			focusedIndex,
			handleFocusPress,
			handleLockedItemPress,
			handlePlaybackStatus,
			isFreeUser,
			isScreenFocused,
			videoHeight,
			videoWidth,
		],
	);

	const showEmptyState = !showSkeleton && data && !hasCapsules;
	const showCapsules = !showSkeleton && data && hasCapsules;

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='La Capsule'
				showAvatar={false}
				containerStyle={styles.pageHeaderContainer}
			/>

			{showSkeleton && <PetitesHistoiresSkeleton />}

			{showEmptyState && (
				<View style={styles.noDataContainer}>
					<Text style={styles.noDataText}>
						Aucune capsule disponible pour le moment
					</Text>
				</View>
			)}

			{showCapsules && (
				<>
					<UpgradeSubscriptionModal
						visible={showUpgradeModal}
						onClose={closeUpgradeModal}
					/>
					<Animated.FlatList
						style={styles.list}
						data={capsules}
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
						windowSize={3}
						maxToRenderPerBatch={2}
						removeClippedSubviews={true}
						initialNumToRender={1}
					/>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	pageHeaderContainer: {
		paddingHorizontal: 30,
	},
	list: {
		marginTop: 30,
		paddingHorizontal: 30,
	},
	contentPadding: {
		paddingRight: 25,
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
	missingVideo: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#111",
	},
	missingVideoText: {
		color: "#FFF",
		fontSize: 16,
		fontWeight: "600",
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
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
	playIcon: {
		color: "#FFF",
		fontSize: 30,
		marginLeft: 4,
	},
});
