import {
	hasParcoursVideoReachedNextThreshold,
	hasUsableParcoursVideoStatus,
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
});
