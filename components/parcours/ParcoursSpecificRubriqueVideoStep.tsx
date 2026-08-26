import SplashScreen from "@/assets/imgs/spalshSceens/petiteHistoire.png";
import ExpoVideo, {
	CompatVideoStatus,
	ManagedVideoHandle,
} from "@/components/media/ExpoVideo";
import {
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14 } from "@/constants/fontsizes";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Animated,
	Image,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";

const MAX_VIDEO_WIDTH = 310;
const VIDEO_ASPECT_RATIO = 9 / 16;
const VIDEO_HORIZONTAL_GUTTER = 16;

export default function ParcoursSpecificRubriqueVideoStep({
	videoUri,
	accentColor,
	initialPositionMillis = 0,
	completed = false,
	onPlaybackStatusUpdate,
	onPlaybackError,
}: {
	videoUri: string;
	accentColor: string;
	initialPositionMillis?: number;
	completed?: boolean;
	onPlaybackStatusUpdate?: (status: CompatVideoStatus) => void;
	onPlaybackError?: (message: string) => void;
}) {
	const { width: windowWidth } = useWindowDimensions();
	const videoWidth = Math.min(
		MAX_VIDEO_WIDTH,
		windowWidth - 48 - VIDEO_HORIZONTAL_GUTTER
	);
	const videoHeight = videoWidth / VIDEO_ASPECT_RATIO;
	const videoRef = useRef<ManagedVideoHandle | null>(null);
	const [overlayOpacity] = useState(() => new Animated.Value(1));
	const previousPositionMillisRef = useRef(initialPositionMillis);
	const hasFinishedPlaybackRef = useRef(completed);
	const [isPlaying, setIsPlaying] = useState(false);
	const [hasFinishedPlayback, setHasFinishedPlayback] = useState(completed);
	const [startPositionMillis] = useState(initialPositionMillis);
	const videoSource = useMemo(() => ({ uri: videoUri }), [videoUri]);

	const fadeOutOverlay = useCallback(() => {
		Animated.timing(overlayOpacity, {
			toValue: 0,
			duration: 350,
			useNativeDriver: true,
		}).start();
	}, [overlayOpacity]);

	const showOverlay = useCallback(() => {
		Animated.timing(overlayOpacity, {
			toValue: 1,
			duration: 250,
			useNativeDriver: true,
		}).start();
	}, [overlayOpacity]);

	const finalizePlayback = useCallback(
		(status?: CompatVideoStatus) => {
			hasFinishedPlaybackRef.current = true;
			setHasFinishedPlayback(true);
			setIsPlaying(false);
			showOverlay();
			const endPositionMillis =
				typeof status?.durationMillis === "number" && status.durationMillis > 0
					? Math.max(status.durationMillis - 250, 0)
					: status?.positionMillis ?? 0;
			previousPositionMillisRef.current = endPositionMillis;
			videoRef.current
				?.setPositionAsync(endPositionMillis, { toleranceMillis: 0 })
				.catch(() => {})
				.finally(() => {
					videoRef.current?.pauseAsync().catch(() => {});
				});
			if (status) {
				onPlaybackStatusUpdate?.({
					...status,
					isPlaying: false,
					positionMillis:
						typeof status.durationMillis === "number"
							? status.durationMillis
							: status.positionMillis,
					didJustFinish: true,
				});
			}
		},
		[onPlaybackStatusUpdate, showOverlay]
	);

	useEffect(() => {
		if (!isPlaying || !videoRef.current || !onPlaybackStatusUpdate) {
			return undefined;
		}

		const interval = setInterval(() => {
			videoRef.current
				?.getStatusAsync()
				.then((status) => {
					const previousPositionMillis = previousPositionMillisRef.current;
					const wrappedToStart =
						typeof status.durationMillis === "number" &&
						previousPositionMillis >= status.durationMillis - 5_000 &&
						status.positionMillis < 1_000;

					if ((!status.isPlaying && status.didJustFinish) || wrappedToStart) {
						finalizePlayback(status);
						previousPositionMillisRef.current = status.positionMillis;
						return;
					}

					previousPositionMillisRef.current = status.positionMillis;
					onPlaybackStatusUpdate(status);
				})
				.catch(() => {});
		}, 1000);

		return () => clearInterval(interval);
	}, [finalizePlayback, isPlaying, onPlaybackStatusUpdate]);

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.videoCard,
					{ borderColor: accentColor, width: videoWidth, height: videoHeight },
				]}>
				<ExpoVideo
					ref={(ref) => {
						videoRef.current = ref;
					}}
					source={videoSource}
					style={styles.video}
					isMuted={false}
					isLooping={false}
					shouldPlay={isPlaying}
					positionMillis={startPositionMillis}
					useNativeControls
					resizeMode='cover'
					onPlaybackStatusUpdate={(status) => {
						if (!status.isPlaying && status.didJustFinish) {
							finalizePlayback(status);
							previousPositionMillisRef.current = status.positionMillis;
							return;
						}
						previousPositionMillisRef.current = status.positionMillis;
						onPlaybackStatusUpdate?.(status);
					}}
					onError={onPlaybackError}
				/>

				{!isPlaying ? (
					<Animated.View
						style={[
							StyleSheet.absoluteFill,
							styles.overlayContainer,
							{
								opacity: overlayOpacity,
								backgroundColor: hasFinishedPlayback
									? "transparent"
									: "#000000",
							},
						]}>
						{hasFinishedPlayback ? null : (
							<Image
								source={SplashScreen}
								style={styles.thumbnail}
								resizeMode='cover'
							/>
						)}
						<Pressable
							style={styles.playButtonContainer}
							onPress={() => {
								if (hasFinishedPlaybackRef.current) {
									hasFinishedPlaybackRef.current = false;
									setHasFinishedPlayback(false);
									previousPositionMillisRef.current = 0;
									videoRef.current?.setPositionAsync(0, { toleranceMillis: 0 }).catch(() => {});
								}
								setIsPlaying(true);
								fadeOutOverlay();
								videoRef.current?.playAsync().catch(() => {});
							}}>
							<Text style={styles.playIcon}>▶</Text>
						</Pressable>
					</Animated.View>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		alignItems: "center",
	},
	videoCard: {
		borderRadius: 28,
		overflow: "hidden",
		backgroundColor: primaryBackground,
		borderWidth: 2,
	},
	video: {
		width: "100%",
		height: "100%",
	},
	overlayContainer: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#000000",
	},
	thumbnail: {
		...StyleSheet.absoluteFill,
		width: "100%",
		height: "100%",
	},
	playButtonContainer: {
		width: 78,
		height: 78,
		borderRadius: 39,
		backgroundColor: "rgba(39,39,39,0.82)",
		alignItems: "center",
		justifyContent: "center",
	},
	playIcon: {
		color: colorWhite,
		fontSize: FontSize14,
		fontWeight: "900",
		marginLeft: 4,
	},
});
