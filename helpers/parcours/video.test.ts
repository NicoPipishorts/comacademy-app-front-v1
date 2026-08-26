import {
	buildParcoursVideoProgressPatch,
	getParcoursVideoNextUnlocked,
	hasParcoursVideoReachedNextThreshold,
	hasUsableParcoursVideoStatus,
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

	it("accepts a completion event even without loaded state", () => {
		expect(
			hasUsableParcoursVideoStatus({
				isLoaded: false,
				durationMillis: null,
				didJustFinish: true,
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

	it("unlocks the next step within the final five seconds", () => {
		expect(
			hasParcoursVideoReachedNextThreshold({
				positionMillis: 25_000,
				durationMillis: 30_000,
			})
		).toBe(true);
	});

	it("keeps the next step locked before the final five seconds", () => {
		expect(
			hasParcoursVideoReachedNextThreshold({
				positionMillis: 24_999,
				durationMillis: 30_000,
			})
		).toBe(false);
	});

	it("does not unlock from invalid duration metadata", () => {
		expect(
			hasParcoursVideoReachedNextThreshold({
				positionMillis: 25_000,
				durationMillis: null,
			})
		).toBe(false);
	});

	it("restores an unlock saved at the end threshold", () => {
		expect(
			getParcoursVideoNextUnlocked({
				videoNextUnlocked: true,
				videoCompleted: false,
			})
		).toBe(true);
	});

	it("treats a completed video as unlocked for replay", () => {
		expect(
			getParcoursVideoNextUnlocked({
				videoNextUnlocked: false,
				videoCompleted: true,
			})
		).toBe(true);
	});

	it("preserves an end-threshold unlock without falsely marking completion", () => {
		expect(
			buildParcoursVideoProgressPatch({
				positionMillis: 25_000,
				durationMillis: 30_000,
				nextUnlocked: true,
				completed: false,
			})
		).toMatchObject({
			videoNextUnlocked: true,
			videoCompleted: false,
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

	it("does not trap the user when a specific rubrique has no video", () => {
		expect(
			shouldRequireParcoursVideoWatch({
				isSpecificRubriqueStep: true,
				videoUri: null,
			})
		).toBe(false);
	});

	it("releases the gate when video playback fails", () => {
		expect(
			shouldRequireParcoursVideoWatch({
				isSpecificRubriqueStep: true,
				videoUri: "https://cdn.example.test/broken.mp4",
				playbackFailed: true,
			})
		).toBe(false);
	});
});
