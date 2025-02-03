import SplashScreen from "@/assets/imgs/spalshSceens/petiteHistoire.png";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetPetitesHistoires from "@/hooks/useGetPetitesHistoires";
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

const LesPetitesHistoires = () => {
	const { token } = useJwtToken();
	const { data, isLoading } = useGetPetitesHistoires(token);
	const insets = useSafeAreaInsets();

	useTrackPageMetrics({ page: "PetiteHistoires" });

	const { width } = Dimensions.get("window");
	const videoWidth = Math.floor(width * 0.8);
	const videoHeight = Math.floor((videoWidth / 9) * 16);

	const videoRefs = useRef({});
	const videoPositions = useRef({});
	const fadeAnim = useRef({}).current;
	const focusedIndexRef = useRef(0);
	const [focusedIndex, setFocusedIndex] = useState(0);
	const [isFirstRender, setIsFirstRender] = useState(true);

	const onViewableItemsChanged = useCallback(
		async ({ viewableItems }) => {
			const visibleIndex = viewableItems[0]?.index;

			if (
				visibleIndex !== undefined &&
				visibleIndex !== focusedIndexRef.current
			) {
				if (videoRefs.current[focusedIndexRef.current]) {
					const status = await videoRefs.current[
						focusedIndexRef.current
					].getStatusAsync();
					if (status.isLoaded) {
						videoPositions.current[focusedIndexRef.current] =
							status.positionMillis;
						videoRefs.current[focusedIndexRef.current].pauseAsync();
					}
				}

				if (fadeAnim[focusedIndexRef.current]) {
					Animated.timing(fadeAnim[focusedIndexRef.current], {
						toValue: 1, // Show splash screen when scrolling away
						duration: 300,
						useNativeDriver: true,
					}).start();
				}

				focusedIndexRef.current = visibleIndex;
				setFocusedIndex(visibleIndex);
				setIsFirstRender(false);

				if (!fadeAnim[visibleIndex]) {
					fadeAnim[visibleIndex] = new Animated.Value(isFirstRender ? 0 : 1);
				}
				Animated.timing(fadeAnim[visibleIndex], {
					toValue: 0, // Hide splash screen when video is in focus
					duration: 400,
					useNativeDriver: true,
				}).start();
			}
		},
		[fadeAnim, isFirstRender]
	);

	const viewabilityConfig = useMemo(
		() => ({
			itemVisiblePercentThreshold: 70,
		}),
		[]
	);

	const renderItem = useCallback(
		({ item, index }) => {
			const videoUri = `${process.env.EXPO_PUBLIC_URL}${item.attributes.videoUri.data.attributes.url}`;
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
						{ height: videoHeight, width: videoWidth },
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

						{/* Splash Screen (Covers only when video is NOT focused) */}
						{!isFocused && (
							<Animated.View
								style={[styles.overlayContainer, { opacity: fadeAnim[index] }]}>
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
		[fadeAnim, videoHeight, videoWidth, isFirstRender]
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
			<View style={{ paddingHorizontal: 30 }}>
				<ScreenHeaders content='La petite histoire' />
			</View>

			<Animated.FlatList
				style={{ marginTop: 30, paddingHorizontal: 30 }}
				data={data.data}
				renderItem={renderItem}
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
		...StyleSheet.absoluteFillObject, // Covers entire video
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
