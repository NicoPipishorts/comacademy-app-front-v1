import {
	useFocusEffect,
	useIsFocused,
	useNavigation,
} from "@react-navigation/native";
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
	ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SplashScreen from "@/assets/imgs/spalshSceens/petiteHistoire.png";
import LockedVideoOverlay from "@/components/experience/LockedVideoOverlay";
import ExpoVideo, { ManagedVideoHandle } from "@/components/media/ExpoVideo";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { usePlaybackReset } from "@/helpers/videoCrontrolsReset";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetMediaList from "@/hooks/useGetMediaList";
import useJwtToken from "@/hooks/useJwtToken";
import { useMinimumLoadingTime } from "@/hooks/useMinimumLoadingTime";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import PetitesHistoiresSkeleton from "./petitesHistoiresSkeleton";

const LesPetitesHistoires: React.FC = () => {
	const { token } = useJwtToken();
	const routeKey = "petites-histoires";
	const { data, isLoading, isFetching } = useGetMediaList(routeKey, token);
	const insets = useSafeAreaInsets();

	useTrackPageMetrics({ page: "PetiteHistoires" });

	const {
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
		isFreeUser,
	} = useSubscriptionLimit({ freeLimit: 5 });

	const isScreenFocused = useIsFocused();
	const navigation = useNavigation();

	const { width } = Dimensions.get("window");
	const videoWidth = Math.floor(width * 0.78);
	const videoHeight = Math.floor((videoWidth / 9) * 16);

	const videoRefs = useRef<Record<number, ManagedVideoHandle | null>>({});
	const videoPositions = useRef<Record<number, number>>({});
	const fadeAnim = useRef<Record<number, Animated.Value>>({}).current;
	const focusedIndexRef = useRef(0);
	const autoPausedRef = useRef<Set<number>>(new Set());
	const playingIndicesRef = useRef<Set<number>>(new Set());

	const [focusedIndex, setFocusedIndex] = useState(0);

	const pauseVideoAtIndex = useCallback(
		async (
			index: number,
			{ markAutoPaused = false }: { markAutoPaused?: boolean } = {},
		) => {
			const ref = videoRefs.current[index];
			if (!ref) return;
			try {
				const status = await ref.getStatusAsync();
				if (!status.isLoaded) return;

				const position =
					typeof status.positionMillis === "number"
						? status.positionMillis
						: (videoPositions.current[index] ?? 0);
				videoPositions.current[index] = position;

				if (status.isPlaying) {
					await ref.pauseAsync();
					playingIndicesRef.current.delete(index);
					if (markAutoPaused) autoPausedRef.current.add(index);
					else autoPausedRef.current.delete(index);
				} else if (!markAutoPaused) {
					autoPausedRef.current.delete(index);
					playingIndicesRef.current.delete(index);
				}
			} catch {
				// ignore
			}
		},
		[],
	);

	const resumeVideoAtIndex = useCallback(async (index: number) => {
		const playing = playingIndicesRef.current;
		if (playing.size > 0 && !(playing.size === 1 && playing.has(index))) return;
		if (!autoPausedRef.current.has(index)) return;

		const ref = videoRefs.current[index];
		if (!ref) {
			autoPausedRef.current.delete(index);
			return;
		}

		try {
			const status = await ref.getStatusAsync();
			if (!status.isLoaded) return;

			const targetPosition =
				videoPositions.current[index] ??
				(typeof status.positionMillis === "number" ? status.positionMillis : 0);

			if (
				typeof status.positionMillis !== "number" ||
				Math.abs(status.positionMillis - targetPosition) > 100
			) {
				await ref.setPositionAsync(targetPosition, { toleranceMillis: 100 });
			}

			if (!status.isPlaying) {
				await ref.playAsync();
				playingIndicesRef.current.add(index);
			}
		} catch {
			// ignore
		} finally {
			autoPausedRef.current.delete(index);
		}
	}, []);

	const handlePlaybackStatus = usePlaybackReset(
		videoRefs,
		videoPositions,
		setFocusedIndex,
	);

	const onStatusUpdate = useCallback(
		(status: any, index: number) => {
			try {
				if (status?.isLoaded && status?.isPlaying) {
					playingIndicesRef.current.add(index);
				} else {
					playingIndicesRef.current.delete(index);
				}
			} catch {
			} finally {
				handlePlaybackStatus(status, index);
			}
		},
		[handlePlaybackStatus],
	);

	const pauseAllVideos = useCallback(async () => {
		const indices = Object.keys(videoRefs.current).map((k) => Number(k));
		await Promise.all(
			indices.map((i) => pauseVideoAtIndex(i, { markAutoPaused: false })),
		);
		playingIndicesRef.current.clear();
	}, [pauseVideoAtIndex]);

	useFocusEffect(
		useCallback(() => {
			return () => {
				pauseAllVideos();
			};
		}, [pauseAllVideos]),
	);

	useEffect(() => {
		const unsub = (navigation as any).addListener("blur", () => {
			pauseAllVideos();
		});
		return unsub;
	}, [navigation, pauseAllVideos]);

	useEffect(() => {
		if (!isScreenFocused) pauseAllVideos();
	}, [isScreenFocused, pauseAllVideos]);

	useEffect(() => {
		const pauseUnfocused = async () => {
			const promises = Object.keys(videoRefs.current).map((k) => {
				const i = Number(k);
				if (i === focusedIndex) return Promise.resolve();
				return pauseVideoAtIndex(i, { markAutoPaused: false });
			});
			await Promise.all(promises);
		};
		pauseUnfocused();
	}, [focusedIndex, pauseVideoAtIndex]);

	const onViewableItemsChanged = useCallback(
		({
			viewableItems,
			changed,
		}: {
			viewableItems: ViewToken[];
			changed: ViewToken[];
		}) => {
			changed?.forEach((token) => {
				if (token.index == null) return;
				if (token.isViewable) {
					void resumeVideoAtIndex(token.index);
				} else {
					void pauseVideoAtIndex(token.index, { markAutoPaused: true });
				}
			});

			const primary = viewableItems
				.filter((t) => t.isViewable && t.index != null)
				.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))[0];

			if (
				primary &&
				primary.index !== undefined &&
				primary.index !== focusedIndexRef.current
			) {
				const newIndex = primary.index;

				const prevAnim = fadeAnim[focusedIndexRef.current];
				if (prevAnim) {
					Animated.timing(prevAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}).start();
				}

				focusedIndexRef.current = newIndex;
				setFocusedIndex(newIndex);

				if (!fadeAnim[newIndex]) {
					fadeAnim[newIndex] = new Animated.Value(1);
				} else {
					fadeAnim[newIndex].setValue(1);
				}
			}
		},
		[pauseVideoAtIndex, resumeVideoAtIndex, fadeAnim],
	);

	const viewabilityConfig = useMemo(
		() => ({
			itemVisiblePercentThreshold: 90,
			minimumViewTime: 100,
		}),
		[],
	);

	const handleScrollBegin = useCallback(() => {
		const indices = Object.keys(videoRefs.current).map((k) => Number(k));
		indices.forEach((i) => void pauseVideoAtIndex(i, { markAutoPaused: true }));
	}, [pauseVideoAtIndex]);

	const stories = useMemo(() => data?.data ?? [], [data]);

	const handleFocusPress = useCallback(
		(index: number) => {
			focusedIndexRef.current = index;
			setFocusedIndex(index);
			videoRefs.current[index]?.playAsync();

			void resumeVideoAtIndex(index);
		},
		[resumeVideoAtIndex],
	);

	const isActuallyLoading =
		(!data || stories.length === 0) && (isLoading || isFetching);

	const showSkeleton = useMinimumLoadingTime({
		isLoading: isActuallyLoading,
		minimumLoadingTime: 1000,
	});

	useEffect(() => {
		if (isLoading) return;
		if (!stories.length) return;

		const initialIndex = 0;
		focusedIndexRef.current = initialIndex;
		setFocusedIndex(initialIndex);

		if (!fadeAnim[initialIndex]) {
			fadeAnim[initialIndex] = new Animated.Value(1);
		} else {
			fadeAnim[initialIndex].setValue(1);
		}

		return () => {
			pauseAllVideos();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, stories.length, pauseAllVideos]);

	const renderItem = useCallback(
		({ item, index }: { item: any; index: number }) => {
			const videoUri = item.videoUri?.url;
			const isFocused = focusedIndex === index;
			const isLocked = isFreeUser && index >= 5;

			if (!fadeAnim[index]) {
				fadeAnim[index] = new Animated.Value(1);
			}

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
							shouldPlay={false}
							positionMillis={videoPositions.current[index] || 0}
							useNativeControls={!isLocked}
							resizeMode='cover'
							onPlaybackStatusUpdate={(status) => onStatusUpdate(status, index)}
							isScreenFocused={isScreenFocused && isFocused}
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
			onStatusUpdate,
			focusedIndex,
			videoHeight,
			videoWidth,
			isFreeUser,
			handleLockedItemPress,
			handleFocusPress,
		],
	);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='La petite histoire'
				showAvatar={false}
				containerStyle={styles.headerPadding}
			/>

			{showSkeleton && <PetitesHistoiresSkeleton />}

			{!showSkeleton && data && stories.length === 0 && (
				<View style={styles.noDataContainer}>
					<Text style={styles.noDataText}>
						Aucune vidéo disponible pour le moment
					</Text>
				</View>
			)}

			{!showSkeleton && data && stories.length > 0 && (
				<>
					<UpgradeSubscriptionModal
						visible={showUpgradeModal}
						onClose={closeUpgradeModal}
					/>

					<Animated.FlatList
						style={styles.list}
						data={stories}
						key={routeKey}
						keyExtractor={(item) => `${routeKey}-${item.id}`}
						renderItem={renderItem}
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.contentPadding}
						onViewableItemsChanged={onViewableItemsChanged}
						viewabilityConfig={viewabilityConfig}
						onScrollBeginDrag={handleScrollBegin}
						onMomentumScrollBegin={handleScrollBegin}
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
	wrapper: { flex: 1, backgroundColor: "#F5F5F5" },
	headerPadding: { paddingHorizontal: 30 },
	list: { paddingHorizontal: 30 },
	contentPadding: { paddingRight: 25 },
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	noDataText: { fontSize: 16, color: "#666", textAlign: "center" },
	cardWrapper: {
		marginLeft: 10,
		marginRight: 24,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "#000",
	},
	videoContainer: { position: "relative", width: "100%", height: "100%" },
	video: { width: "100%", height: "100%" },
	overlayContainer: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	thumbnail: { width: "100%", height: "100%" },
	playButtonContainer: {
		position: "absolute",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	playIcon: { color: "#FFF", fontSize: 30 },
});

export default LesPetitesHistoires;
