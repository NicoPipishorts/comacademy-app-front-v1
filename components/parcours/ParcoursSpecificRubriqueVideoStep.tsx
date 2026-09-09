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
import {
	VIDEO_NEXT_UNLOCK_RATIO,
	resolveParcoursVideoDuration,
} from "@/helpers/parcours/video";
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
/** How often playback is sampled while the user is watching. */
const WATCH_TICK_MS = 1000;
/**
 * Largest position jump between two ticks that still counts as watching.
 * Anything larger is a seek (native scrubber, resume) and is not credited.
 */
const MAX_CREDITED_TICK_MS = 2500;

export default function ParcoursSpecificRubriqueVideoStep({
	videoUri,
	accentColor,
	initialPositionMillis = 0,
	initialWatchedMillis = 0,
	completed = false,
	durationMillis = null,
	onPlaybackStatusUpdate,
	onPlaybackError,
}: {
	videoUri: string;
	accentColor: string;
	initialPositionMillis?: number;
	/** Watched time already persisted for this step, so a resume keeps counting. */
	initialWatchedMillis?: number;
	completed?: boolean;
	/** Server-provided duration, used when the player has no metadata yet. */
	durationMillis?: number | null;
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
	const hasFinishedPlaybackRef = useRef(completed);
	// Milliseconds of real playback observed so far. Only advances from ticks
	// taken while the player reports it is playing, and only by plausible
	// increments, so seeks and phantom "ended" events never inflate it.
	const watchedMillisRef = useRef(Math.max(0, initialWatchedMillis));
	const lastTickPositionRef = useRef<number | null>(null);
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

	const getKnownDurationMillis = useCallback(
		(status?: CompatVideoStatus) =>
			resolveParcoursVideoDuration({
				serverDurationMillis: durationMillis,
				playerDurationMillis: status?.durationMillis,
			}),
		[durationMillis]
	);

	const withWatchedTime = useCallback(
		(status: CompatVideoStatus): CompatVideoStatus => ({
			...status,
			watchedMillis: watchedMillisRef.current,
		}),
		[]
	);

	/** Credit real playback between two consecutive samples. */
	const recordTick = useCallback((status: CompatVideoStatus) => {
		const position =
			typeof status.positionMillis === "number" &&
			Number.isFinite(status.positionMillis)
				? status.positionMillis
				: null;
		if (position === null) {
			return;
		}

		const previous = lastTickPositionRef.current;
		lastTickPositionRef.current = position;
		if (!status.isPlaying || previous === null) {
			return;
		}

		const delta = position - previous;
		if (delta > 0 && delta <= MAX_CREDITED_TICK_MS) {
			watchedMillisRef.current += delta;
		}
	}, []);

	/**
	 * The player's "ended" signal is only believed once watched time backs it:
	 * expo-video can fire it on load, before any frame has played.
	 */
	const isProvenEnd = useCallback(
		(status: CompatVideoStatus) => {
			const knownDurationMillis = getKnownDurationMillis(status);
			return Boolean(
				status.didJustFinish &&
					knownDurationMillis &&
					watchedMillisRef.current / knownDurationMillis >=
						VIDEO_NEXT_UNLOCK_RATIO
			);
		},
		[getKnownDurationMillis]
	);

	const finalizePlayback = useCallback(
		(status: CompatVideoStatus) => {
			hasFinishedPlaybackRef.current = true;
			setHasFinishedPlayback(true);
			setIsPlaying(false);
			showOverlay();
			const knownDurationMillis = getKnownDurationMillis(status);
			const endPositionMillis =
				knownDurationMillis !== null
					? Math.max(knownDurationMillis - 250, 0)
					: status.positionMillis ?? 0;
			lastTickPositionRef.current = endPositionMillis;
			videoRef.current
				?.setPositionAsync(endPositionMillis, { toleranceMillis: 0 })
				.catch(() => {})
				.finally(() => {
					videoRef.current?.pauseAsync().catch(() => {});
				});
			onPlaybackStatusUpdate?.(
				withWatchedTime({
					...status,
					isPlaying: false,
					durationMillis: knownDurationMillis ?? status.durationMillis,
					didJustFinish: true,
				})
			);
		},
		[getKnownDurationMillis, onPlaybackStatusUpdate, showOverlay, withWatchedTime]
	);

	const handleStatus = useCallback(
		(status: CompatVideoStatus, { fromTick }: { fromTick: boolean }) => {
			if (fromTick) {
				recordTick(status);
			}

			if (status.didJustFinish) {
				if (isProvenEnd(status)) {
					if (!hasFinishedPlaybackRef.current) {
						finalizePlayback(status);
					}
					return;
				}
				// Unproven end: report the sample but never as a completion.
				onPlaybackStatusUpdate?.(
					withWatchedTime({ ...status, didJustFinish: false })
				);
				return;
			}

			onPlaybackStatusUpdate?.(withWatchedTime(status));
		},
		[finalizePlayback, isProvenEnd, onPlaybackStatusUpdate, recordTick, withWatchedTime]
	);

	useEffect(() => {
		if (!isPlaying || !videoRef.current) {
			return undefined;
		}

		const interval = setInterval(() => {
			videoRef.current
				?.getStatusAsync()
				.then((status) => handleStatus(status, { fromTick: true }))
				.catch(() => {});
		}, WATCH_TICK_MS);

		return () => clearInterval(interval);
	}, [handleStatus, isPlaying]);

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
						// Event-driven samples only forward state; watched time is
						// credited from the timed ticks so nothing is counted twice.
						handleStatus(status, { fromTick: false });
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
									lastTickPositionRef.current = 0;
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
