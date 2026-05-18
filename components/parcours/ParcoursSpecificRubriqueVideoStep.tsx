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
	View,
} from "react-native";

const VIDEO_WIDTH = 280;
const VIDEO_HEIGHT = 498;

export default function ParcoursSpecificRubriqueVideoStep({
	videoUri,
	accentColor,
	initialPositionMillis = 0,
	onPlaybackStatusUpdate,
}: {
	videoUri: string;
	accentColor: string;
	initialPositionMillis?: number;
	onPlaybackStatusUpdate?: (status: CompatVideoStatus) => void;
}) {
	const videoRef = useRef<ManagedVideoHandle | null>(null);
	const overlayOpacity = useRef(new Animated.Value(1)).current;
	const previousPositionMillisRef = useRef(initialPositionMillis);
	const [isPlaying, setIsPlaying] = useState(false);
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
			setIsPlaying(false);
			showOverlay();
			videoRef.current?.pauseAsync().catch(() => {});
			if (status) {
				onPlaybackStatusUpdate?.({
					...status,
					isPlaying: false,
					didJustFinish: true,
				});
			}
		},
		[onPlaybackStatusUpdate, showOverlay]
	);

	useEffect(() => {
		if (!isPlaying || !videoRef.current || !onPlaybackStatusUpdate) {
			return;
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
			<View style={[styles.videoCard, { borderColor: accentColor }]}>
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
				/>

				{!isPlaying ? (
					<Animated.View
						style={[
							StyleSheet.absoluteFillObject,
							styles.overlayContainer,
							{ opacity: overlayOpacity },
						]}>
						<Image source={SplashScreen} style={styles.thumbnail} resizeMode='cover' />
						<Pressable
							style={styles.playButtonContainer}
							onPress={() => {
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
		alignItems: "center",
	},
	videoCard: {
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
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
		...StyleSheet.absoluteFillObject,
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
