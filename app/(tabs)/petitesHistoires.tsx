// File: src/screens/LesPetitesHistoires.tsx
import {
	useFocusEffect,
	useIsFocused,
	useNavigation,
} from "@react-navigation/native";
import { BlurView } from "expo-blur";
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
import ScreenHeaders from "@/components/ScreenHeaders";
import { usePlaybackReset } from "@/helpers/videoCrontrolsReset";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetMediaList from "@/hooks/useGetMediaList";
import useJwtToken from "@/hooks/useJwtToken";
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

	// Dimensions for videos
	const { width } = Dimensions.get("window");
	const videoWidth = Math.floor(width * 0.8);
	const videoHeight = Math.floor((videoWidth / 9) * 16);

	// Refs for videos, positions, fade animations
	const videoRefs = useRef<Record<number, ManagedVideoHandle | null>>({});
	const videoPositions = useRef<Record<number, number>>({});
	const fadeAnim = useRef<Record<number, Animated.Value>>({}).current;
	const focusedIndexRef = useRef(0);

	// Local state
	const [focusedIndex, setFocusedIndex] = useState(0);
	const [isFirstRender, setIsFirstRender] = useState(true);

	const handlePlaybackStatus = usePlaybackReset(
		videoRefs,
		videoPositions,
		setFocusedIndex
	);

	// Pause all videos helper
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

	// Pause whenever screen loses focus or unmounts (navigation blur)
	useFocusEffect(
		useCallback(() => {
			return () => {
				pauseAllVideos();
			};
		}, [pauseAllVideos])
	);

	// EXTRA: also pause on tab blur explicitly
	useEffect(() => {
		const unsub = navigation.addListener("blur", () => {
			pauseAllVideos();
		});
		return unsub;
	}, [navigation, pauseAllVideos]);

	// EXTRA: pause when focus flag flips to false (some routers keep screen mounted)
	useEffect(() => {
		if (!isScreenFocused) {
			pauseAllVideos();
		}
	}, [isScreenFocused, pauseAllVideos]);

	// When the visible item changes, pause the old and play the new
	const onViewableItemsChanged = useCallback(
		async ({ viewableItems }: { viewableItems: { index?: number }[] }) => {
			const newIndex = viewableItems[0]?.index;
			if (newIndex !== undefined && newIndex !== focusedIndexRef.current) {
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
				setIsFirstRender(false);

				// Check if new index is locked
				const isNewIndexLocked = isFreeUser && newIndex >= 5;

				if (!fadeAnim[newIndex]) {
					fadeAnim[newIndex] = new Animated.Value(1);
				}

				// Only fade out and play if not locked
				if (!isNewIndexLocked) {
					Animated.timing(fadeAnim[newIndex], {
						toValue: 0,
						duration: 400,
						useNativeDriver: true,
					}).start();

					const newRef = videoRefs.current[newIndex];
					if (newRef) {
						const resumePosition = videoPositions.current[newIndex] || 0;
						await newRef.setPositionAsync(resumePosition, {
							toleranceMillis: 50,
						});
						await newRef.playAsync();
					}
				}
			}
		},
		[fadeAnim, isFirstRender, setFocusedIndex, isFreeUser]
	);

	const viewabilityConfig = useMemo(
		() => ({ itemVisiblePercentThreshold: 70 }),
		[]
	);

	const stories = useMemo(() => data?.data ?? [], [data]);

	const showSkeleton =
		(!data || stories.length === 0) && (isLoading || isFetching);

	// OPTIONAL (parity with TrenteSecondes): autoplay first item on mount; pause on hard unmount
	useEffect(() => {
		if (isLoading) return;
		if (!stories.length) return;

		const initialIndex = 0;
		const locked = isFreeUser && initialIndex >= 5;

		focusedIndexRef.current = initialIndex;
		setFocusedIndex(initialIndex);
		setIsFirstRender(false);

		if (!fadeAnim[initialIndex]) {
			fadeAnim[initialIndex] = new Animated.Value(0);
		} else {
			fadeAnim[initialIndex].setValue(0);
		}

		if (!locked) {
			const tryPlay = () => {
				const ref = videoRefs.current[initialIndex];
				if (ref) {
					ref.playAsync().catch(() => {});
				} else {
					requestAnimationFrame(tryPlay);
				}
			};
			tryPlay();
		}

		return () => {
			pauseAllVideos();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, isFreeUser, stories.length, pauseAllVideos]);

	const renderItem = useCallback(
		({ item, index }: { item: any; index: number }) => {
			const videoUri = item.attributes.videoUri;
			const isFocused = focusedIndex === index;
			const isLocked = isFreeUser && index >= 5;
			const shouldPlayVideo = isScreenFocused && isFocused && !isLocked;

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
						<ExpoVideo
							ref={(ref: ManagedVideoHandle | null) => {
								videoRefs.current[index] = ref;
							}}
							source={{ uri: videoUri }}
							style={styles.video}
							isMuted={false}
							isLooping={false}
							shouldPlay={shouldPlayVideo}
							positionMillis={videoPositions.current[index] || 0}
							useNativeControls={!isLocked}
							onPlaybackStatusUpdate={(status) =>
								handlePlaybackStatus(status, index)
							}
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
			isFirstRender,
			focusedIndex,
			videoHeight,
			videoWidth,
			isFreeUser,
			handleLockedItemPress,
			isScreenFocused,
		]
	);

	if (showSkeleton) {
		return <PetitesHistoiresSkeleton paddingTop={insets.top} />;
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
				<ScreenHeaders content='La petite histoire' />
			</View>

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

export default LesPetitesHistoires;
