import { useEvent } from "expo";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
	VideoContentFit,
	VideoPlayer,
	VideoSource,
	VideoView,
	useVideoPlayer,
} from "expo-video";

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
	} = props;

	const statusRef = useRef<CompatVideoStatus>({ ...defaultStatus });
	const videoTrackSizeRef = useRef<{ width: number; height: number } | null>(null);

	const player = useVideoPlayer(source, (instance) => {
		instance.loop = isLooping;
		instance.muted = isMuted;
		instance.timeUpdateEventInterval = 0.5;
	});

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
		player.timeUpdateEventInterval = 0.5;
	}, [player]);

	useEffect(() => {
		if (shouldPlay) {
			player.play();
		} else {
			player.pause();
			emitStatus({ isPlaying: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [player, shouldPlay]);

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

	useEvent(player, "videoTrackChange", (payload) => {
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
	});

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

	return <VideoView player={player} style={style} {...memoizedProps} />;
});

ExpoVideo.displayName = "ExpoVideo";

export default ExpoVideo;
