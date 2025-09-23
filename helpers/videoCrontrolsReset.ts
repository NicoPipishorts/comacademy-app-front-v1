import { AVPlaybackStatus, Video } from "expo-av";
import { useCallback } from "react";

type VideoRefs = Record<number, Video | null>;
type VideoPositions = Record<number, number>;

type PlaybackResetHook = (
	status: AVPlaybackStatus,
	index: number
) => Promise<void>;

/**
 * Hook to generate a reusable playback status handler that resets
 * video position to start when playback finishes.
 *
 * @param videoRefs    Mutable ref object holding Video refs by index
 * @param videoPositions Mutable ref object holding saved positions by index
 * @param setFocusedIndex State setter for focused index to trigger re-render
 * @returns            handler to pass as onPlaybackStatusUpdate
 */
export function usePlaybackReset(
	videoRefs: React.MutableRefObject<VideoRefs>,
	videoPositions: React.MutableRefObject<VideoPositions>,
	setFocusedIndex: React.Dispatch<React.SetStateAction<number>>
): PlaybackResetHook {
	return useCallback(
		async (status: AVPlaybackStatus, index: number) => {
			if ("didJustFinish" in status && status.didJustFinish) {
				const ref = videoRefs.current[index];
				if (ref) {
					// Pause playback
					await ref.pauseAsync();
					// Rewind to start
					await ref.setPositionAsync(0);
					// Reset saved position
					videoPositions.current[index] = 0;
					// Force update so shouldPlay stays in sync
					setFocusedIndex((i) => i);
				}
			}
		},
		[videoRefs, videoPositions, setFocusedIndex]
	);
}
