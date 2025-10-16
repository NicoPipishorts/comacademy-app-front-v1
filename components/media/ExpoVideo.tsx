import { useEvent } from "expo";
import { setAudioModeAsync } from "expo-audio";
import {
	VideoContentFit,
	VideoPlayer,
	VideoSource,
	VideoView,
	useVideoPlayer,
} from "expo-video";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { StyleProp, ViewStyle } from "react-native";

type LoadEventPayload = {
	naturalSize: {
		width: number;
		height: number;
		orientation: "landscape" | "portrait";
	};
};

export type CompatVideoStatus = {
	isLoaded: boolean;
	isPlaying: boolean;
	positionMillis: number;
	durationMillis: number | null;
	didJustFinish: boolean;
};

export interface ManagedVideoHandle {
	playAsync: () => Promise<void>;
	pauseAsync: () => Promise<void>;
	getStatusAsync: () => Promise<CompatVideoStatus>;
	setPositionAsync: (
		millis: number,
		options?: { toleranceMillis?: number }
	) => Promise<void>;
}

type Props = {
	source: VideoSource;
	style?: StyleProp<ViewStyle>;
	isMuted?: boolean;
	isLooping?: boolean;
	shouldPlay?: boolean;
	positionMillis?: number;
	useNativeControls?: boolean;
	resizeMode?: VideoContentFit;
	onPlaybackStatusUpdate?: (status: CompatVideoStatus) => void;
	onLoadStart?: () => void;
	onReadyForDisplay?: (event: LoadEventPayload) => void;
	/** Configure a shared audio session suitable for video playback. */
	useAudioSession?: boolean;
	/** Pause video when screen is not focused */
	isScreenFocused?: boolean;
};

const defaultStatus: CompatVideoStatus = {
	isLoaded: false,
	isPlaying: false,
	positionMillis: 0,
	durationMillis: null,
	didJustFinish: false,
};

const ExpoVideo = forwardRef<ManagedVideoHandle, Props>((props, ref) => {
	const {
		source,
		style,
		isMuted = false,
		isLooping = false,
		shouldPlay = false,
		positionMillis,
		useNativeControls = true,
		resizeMode = "contain",
		onPlaybackStatusUpdate,
		onLoadStart,
		onReadyForDisplay,
		useAudioSession = true,
		isScreenFocused = true,
	} = props;

	const statusRef = useRef<CompatVideoStatus>({ ...defaultStatus });
	const videoTrackSizeRef = useRef<{ width: number; height: number } | null>(
		null
	);

	const player = useVideoPlayer(source, (instance) => {
		instance.loop = isLooping;
		instance.muted = isMuted;
		instance.timeUpdateEventInterval = 1.0;
	});

	useEffect(() => {
		if (!useAudioSession) {
			return;
		}
		void (async () => {
			try {
				await setAudioModeAsync({
					playsInSilentMode: true,
					allowsRecording: false,
					shouldPlayInBackground: false,
					shouldRouteThroughEarpiece: false,
					interruptionMode: "mixWithOthers",
					interruptionModeAndroid: "duckOthers",
				});
			} catch {
				// ignore session configuration issues
			}
		})();
	}, [useAudioSession]);

	const emitStatus = useCallback(
		(update: Partial<CompatVideoStatus>) => {
			statusRef.current = {
				...statusRef.current,
				...update,
				durationMillis:
					typeof update.durationMillis === "number"
						? update.durationMillis
						: statusRef.current.durationMillis,
			};
			if (onPlaybackStatusUpdate) {
				const snapshot = { ...statusRef.current };
				setTimeout(() => onPlaybackStatusUpdate(snapshot), 0);
			}
		},
		[onPlaybackStatusUpdate]
	);

	const syncDuration = useCallback(
		(currentPlayer: VideoPlayer) => {
			const durationSeconds = currentPlayer.duration;
			if (Number.isFinite(durationSeconds) && durationSeconds >= 0) {
				emitStatus({ durationMillis: durationSeconds * 1000 });
			}
		},
		[emitStatus]
	);

	useEffect(() => {
		statusRef.current = { ...defaultStatus };
		onLoadStart?.();
	}, [player, onLoadStart]);

	useEffect(() => {
		player.muted = isMuted;
	}, [player, isMuted]);

	useEffect(() => {
		player.loop = isLooping;
	}, [player, isLooping]);

	useEffect(() => {
		player.timeUpdateEventInterval = 1.0;
	}, [player]);

	useEffect(() => {
		if (shouldPlay && isScreenFocused) {
			player.play();
		} else if (!isScreenFocused) {
			player.pause();
			emitStatus({ isPlaying: false });
		} else if (shouldPlay === false) {
			player.pause();
			emitStatus({ isPlaying: false });
		}
	}, [player, shouldPlay, isScreenFocused, emitStatus]);

	// Separate effect to handle screen focus changes and pause immediately
	useEffect(() => {
		if (!isScreenFocused && player.playing) {
			player.pause();
			emitStatus({ isPlaying: false });
		}
	}, [isScreenFocused, player, emitStatus]);

	useEffect(() => {
		if (typeof positionMillis !== "number") return;
		const nextSeconds = positionMillis / 1000;
		if (Math.abs(statusRef.current.positionMillis - positionMillis) > 50) {
			player.currentTime = nextSeconds;
			emitStatus({ positionMillis, didJustFinish: false });
		}
	}, [player, positionMillis, emitStatus]);

	useEvent(player, "statusChange", (payload) => {
		if (!payload) {
			return;
		}
		const { status } = payload;
		if (!status) {
			return;
		}
		if (status === "loading") {
			emitStatus({ isLoaded: false, didJustFinish: false });
			return;
		}

		if (status === "readyToPlay") {
			syncDuration(player);
			emitStatus({ isLoaded: true, didJustFinish: false });

			const size = videoTrackSizeRef.current;
			if (size && onReadyForDisplay) {
				onReadyForDisplay({
					naturalSize: {
						width: size.width,
						height: size.height,
						orientation: size.width >= size.height ? "landscape" : "portrait",
					},
				});
			}
		}
	});

	useEvent(player, "playingChange", (payload) => {
		if (!payload) {
			return;
		}
		const { isPlaying } = payload;
		if (typeof isPlaying !== "boolean") {
			return;
		}
		emitStatus({ isPlaying, didJustFinish: false });
	});

	useEvent(player, "timeUpdate", (payload) => {
		if (!payload) {
			return;
		}
		const { currentTime } = payload;
		if (typeof currentTime !== "number") {
			return;
		}
		syncDuration(player);
		emitStatus({ positionMillis: currentTime * 1000 });
	});

	useEvent(player, "playToEnd", () => {
		emitStatus({
			didJustFinish: true,
			isPlaying: false,
			positionMillis:
				statusRef.current.durationMillis ?? statusRef.current.positionMillis,
		});
	});

	interface VideoTrackSize {
		width: number;
		height: number;
	}

	interface VideoTrack {
		size: VideoTrackSize;
	}

	interface VideoTrackChangePayload {
		videoTrack?: VideoTrack;
	}

	useEvent(
		player,
		"videoTrackChange",
		(payload: VideoTrackChangePayload | undefined) => {
			if (!payload) {
				return;
			}
			const { videoTrack } = payload;
			if (videoTrack) {
				videoTrackSizeRef.current = {
					width: videoTrack.size.width,
					height: videoTrack.size.height,
				};
				if (statusRef.current.isLoaded && onReadyForDisplay) {
					onReadyForDisplay({
						naturalSize: {
							width: videoTrack.size.width,
							height: videoTrack.size.height,
							orientation:
								videoTrack.size.width >= videoTrack.size.height
									? "landscape"
									: "portrait",
						},
					});
				}
			}
		}
	);

	useImperativeHandle(
		ref,
		() => ({
			async playAsync() {
				player.play();
				emitStatus({ isPlaying: true, didJustFinish: false });
			},
			async pauseAsync() {
				player.pause();
				emitStatus({ isPlaying: false });
			},
			async getStatusAsync() {
				syncDuration(player);
				return { ...statusRef.current };
			},
			async setPositionAsync(millis: number) {
				const seconds = millis / 1000;
				player.currentTime = seconds;
				emitStatus({ positionMillis: millis, didJustFinish: false });
			},
		}),
		[player, emitStatus, syncDuration]
	);

	const memoizedProps = useMemo(
		() => ({
			nativeControls: useNativeControls,
			contentFit: resizeMode,
		}),
		[useNativeControls, resizeMode]
	);

	// Cleanup player on unmount
	useEffect(() => {
		return () => {
			try {
				player.pause();
			} catch {
				// ignore cleanup errors
			}
		};
	}, [player]);

	return <VideoView player={player} style={style} {...memoizedProps} />;
});

ExpoVideo.displayName = "ExpoVideo";

export default ExpoVideo;
