// File: src/components/leJeu/TopDesFlops.tsx
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
import Loader from "@/components/experience/loader";
import ExpoVideo, { ManagedVideoHandle } from "@/components/media/ExpoVideo";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import ScreenHeaders from "@/components/ScreenHeaders";
import { usePlaybackReset } from "@/helpers/videoCrontrolsReset";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetMediaList from "@/hooks/useGetMediaList";
import useJwtToken from "@/hooks/useJwtToken";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";

const TopDesFlops: React.FC = () => {
	const { token } = useJwtToken();
	const routeKey = "top-des-flops";
	const { data, isLoading } = useGetMediaList(routeKey, token);
	const insets = useSafeAreaInsets();
	const isScreenFocused = useIsFocused();
	const navigation = useNavigation();

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
	const [isFirstRender, setIsFirstRender] = useState(true);

	const handlePlaybackStatus = usePlaybackReset(
		videoRefs,
		videoPositions,
		setFocusedIndex
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
		}, [pauseAllVideos])
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
				setIsFirstRender(false);

				// 4) Init fadeAnim for new index if needed
				if (!fadeAnim[newIndex]) {
					fadeAnim[newIndex] = new Animated.Value(
						isFirstRender && newIndex === 0 ? 0 : 1
					);
				}
				// 5) Fade out splash on new (only if not locked)
				const isNewIndexLocked = isFreeUser && newIndex >= 5;
				if (!isNewIndexLocked) {
					Animated.timing(fadeAnim[newIndex], {
						toValue: 0,
						duration: 400,
						useNativeDriver: true,
					}).start();
				}
			}
		},
		[fadeAnim, isFirstRender, isFreeUser]
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

	// Autoplay first focused video on mount; pause all on unmount
	useEffect(() => {
		if (isLoading) return;
		if (!reversedStories.length) return;

		const initialIndex = 0;
		const locked = isFreeUser && initialIndex >= 5;

		// Sync state and refs
		focusedIndexRef.current = initialIndex;
		setFocusedIndex(initialIndex);
		setIsFirstRender(false);

		// Ensure overlay for first item is hidden
		if (!fadeAnim[initialIndex]) {
			fadeAnim[initialIndex] = new Animated.Value(0);
		} else {
			fadeAnim[initialIndex].setValue(0);
		}

		// Try to play as soon as the ref is ready
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

		// Also pause on hard unmount
		return () => {
			pauseAllVideos();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, isFreeUser, reversedStories.length, pauseAllVideos]);

	// Render each item
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
							<TouchableOpacity
								activeOpacity={1}
								onPress={handleLockedItemPress}
								style={[StyleSheet.absoluteFillObject]}>
								<BlurView intensity={80} style={styles.lockedOverlay}>
									<View style={styles.lockedContent}>
										<Text style={styles.lockIcon}>🔒</Text>
										<Text style={styles.lockedText}>Contenu Premium</Text>
										<Text style={styles.lockedSubtext}>
											Passez à Premium pour accéder
										</Text>
									</View>
								</BlurView>
							</TouchableOpacity>
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
				<ScreenHeaders content='Le top des flops' />
			</View>

			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message='Les 5 premières vidéos Top des Flops sont gratuites. Passez à un abonnement premium pour accéder à toutes les vidéos.'
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
	lockedOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	lockedContent: {
		alignItems: "center",
		padding: 20,
	},
	lockIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	lockedText: {
		color: "#FFF",
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 8,
		textAlign: "center",
	},
	lockedSubtext: {
		color: "#CCC",
		fontSize: 14,
		textAlign: "center",
	},
});

export default TopDesFlops;
