import {
	VIDEO_CHECKPOINT_MS,
	buildParcoursVideoProgressPatch,
	getParcoursVideoCompleted,
	getParcoursVideoNextUnlocked,
	getParcoursVideoWatchedMillis,
	hasParcoursVideoReachedNextThreshold,
	hasUsableParcoursVideoStatus,
	resolveParcoursVideoDuration,
	resolveParcoursVideoDurationMillis,
	shouldPersistParcoursVideoCheckpoint,
	shouldRequireParcoursVideoWatch,
} from "./video";

describe("Parcours video progress", () => {
	it("accepts timed progress when expo-video misses the ready event", () => {
		expect(
			hasUsableParcoursVideoStatus({
				isLoaded: false,
				durationMillis: 30_000,
				didJustFinish: false,
			})
		).toBe(true);
	});

	it("rejects an event that has neither loaded state nor timing", () => {
		expect(
			hasUsableParcoursVideoStatus({
				isLoaded: false,
				durationMillis: null,
				didJustFinish: false,
			})
		).toBe(false);
	});

	it("unlocks the next step once 90 percent has been watched", () => {
		expect(
			hasParcoursVideoReachedNextThreshold({
				watchedMillis: 27_000,
				durationMillis: 30_000,
			})
		).toBe(true);
	});

	it("keeps the next step locked before 90 percent has been watched", () => {
		expect(
			hasParcoursVideoReachedNextThreshold({
				watchedMillis: 26_999,
				durationMillis: 30_000,
			})
		).toBe(false);
	});

	it("does not unlock from invalid duration metadata", () => {
		expect(
			hasParcoursVideoReachedNextThreshold({
				watchedMillis: 27_000,
				durationMillis: null,
			})
		).toBe(false);
		expect(
			hasParcoursVideoReachedNextThreshold({
				watchedMillis: 27_000,
				durationMillis: 0,
			})
		).toBe(false);
	});

	it("reads the server duration from the step content", () => {
		expect(
			resolveParcoursVideoDurationMillis({ videoDurationMillis: 34_100 })
		).toBe(34_100);
		expect(resolveParcoursVideoDurationMillis({ videoDurationMillis: null })).toBe(
			null
		);
		expect(resolveParcoursVideoDurationMillis({})).toBe(null);
	});

	it("prefers the server duration over persisted and player values", () => {
		expect(
			resolveParcoursVideoDuration({
				serverDurationMillis: 34_100,
				persistedDurationMillis: 30_000,
				playerDurationMillis: 29_000,
			})
		).toBe(34_100);
		expect(
			resolveParcoursVideoDuration({
				serverDurationMillis: null,
				persistedDurationMillis: 30_000,
				playerDurationMillis: 29_000,
			})
		).toBe(30_000);
		expect(
			resolveParcoursVideoDuration({
				serverDurationMillis: null,
				persistedDurationMillis: undefined,
				playerDurationMillis: 0,
			})
		).toBe(null);
	});

	it("persists once per checkpoint bucket while watched time advances", () => {
		expect(VIDEO_CHECKPOINT_MS).toBe(5_000);
		expect(
			shouldPersistParcoursVideoCheckpoint({
				previousCheckpointMillis: 0,
				nextPositionMillis: 4_900,
			})
		).toBe(false);
		expect(
			shouldPersistParcoursVideoCheckpoint({
				previousCheckpointMillis: 0,
				nextPositionMillis: 5_100,
			})
		).toBe(true);
		expect(
			shouldPersistParcoursVideoCheckpoint({
				previousCheckpointMillis: 5_100,
				nextPositionMillis: 9_800,
			})
		).toBe(false);
		expect(
			shouldPersistParcoursVideoCheckpoint({
				previousCheckpointMillis: 20_000,
				nextPositionMillis: 3_000,
			})
		).toBe(false);
	});

	it("restores an unlock only when persisted watched time proves 90 percent", () => {
		expect(
			getParcoursVideoNextUnlocked({
				videoNextUnlocked: true,
				videoWatchedMillis: 27_000,
				videoDurationMillis: 30_000,
			})
		).toBe(true);
		expect(
			getParcoursVideoNextUnlocked({
				videoNextUnlocked: true,
				videoWatchedMillis: 26_999,
				videoDurationMillis: 30_000,
			})
		).toBe(false);
	});

	it("rejects flags without watched time", () => {
		expect(
			getParcoursVideoNextUnlocked({
				videoNextUnlocked: true,
				videoCompleted: true,
			})
		).toBe(false);
	});

	it("rejects a phantom end event: position at the end, nothing watched", () => {
		// Exactly what the old code persisted 20 ms after the file was first
		// requested: a seek to duration - 250 ms, with zero playback.
		const phantomState = {
			videoNextUnlocked: true,
			videoCompleted: false,
			videoCheckpointMillis: 22_750,
			videoDurationMillis: 23_000,
			videoProgressPercent: 98.9,
		};
		expect(getParcoursVideoNextUnlocked(phantomState)).toBe(false);
		expect(getParcoursVideoNextUnlocked(phantomState, 23_000)).toBe(false);
		expect(getParcoursVideoCompleted({ ...phantomState, videoCompleted: true })).toBe(
			false
		);
	});

	it("uses the server duration for progress persisted before the duration was known", () => {
		expect(getParcoursVideoNextUnlocked({ videoWatchedMillis: 31_000 }, 34_100)).toBe(
			true
		);
		expect(getParcoursVideoNextUnlocked({ videoWatchedMillis: 30_000 }, 34_100)).toBe(
			false
		);
	});

	it("restores a completed video when watched time proves playback", () => {
		const state = {
			videoNextUnlocked: true,
			videoCompleted: true,
			videoCheckpointMillis: 30_000,
			videoWatchedMillis: 29_500,
			videoDurationMillis: 30_000,
		};
		expect(getParcoursVideoNextUnlocked(state)).toBe(true);
		expect(getParcoursVideoCompleted(state)).toBe(true);
		expect(getParcoursVideoWatchedMillis(state)).toBe(29_500);
		expect(getParcoursVideoWatchedMillis(undefined)).toBe(0);
	});

	it("writes watched time, resume position and percent in the progress patch", () => {
		expect(
			buildParcoursVideoProgressPatch({
				positionMillis: 27_400,
				watchedMillis: 27_000,
				durationMillis: 30_000,
				nextUnlocked: true,
				completed: false,
			})
		).toMatchObject({
			videoCheckpointMillis: 27_400,
			videoWatchedMillis: 27_000,
			videoProgressPercent: 90,
			videoNextUnlocked: true,
			videoCompleted: false,
		});
		expect(
			buildParcoursVideoProgressPatch({
				positionMillis: 12_345.6,
				durationMillis: null,
				nextUnlocked: false,
				completed: false,
			})
		).toMatchObject({
			videoCheckpointMillis: 12_346,
			videoWatchedMillis: 0,
			videoDurationMillis: undefined,
			videoProgressPercent: undefined,
		});
	});

	it("gates every specific-rubrique step that has a playable video", () => {
		expect(
			shouldRequireParcoursVideoWatch({
				isSpecificRubriqueStep: true,
				videoUri: "https://cdn.example.test/video.mp4",
			})
		).toBe(true);
	});

	it("releases the gate when the video failed to load", () => {
		expect(
			shouldRequireParcoursVideoWatch({
				isSpecificRubriqueStep: true,
				videoUri: "https://cdn.example.test/broken.mp4",
				playbackFailed: true,
			})
		).toBe(false);
	});

	it("does not trap the user when a specific rubrique has no video", () => {
		expect(
			shouldRequireParcoursVideoWatch({
				isSpecificRubriqueStep: true,
				videoUri: null,
			})
		).toBe(false);
	});
});
