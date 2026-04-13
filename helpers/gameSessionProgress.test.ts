import {
	getDisplayedCardCounter,
	getNextCardNumber,
	getSessionCurrentCardNumber,
	getSessionCurrentIndex,
} from "./gameSessionProgress";

describe("gameSessionProgress", () => {
	it("starts a fresh round at 1 out of 15", () => {
		expect(
			getSessionCurrentCardNumber({
				answeredCount: 0,
				questionsPool: Array.from({ length: 15 }, (_, index) => ({
					id: index + 1,
					attributes: {} as never,
				})),
			})
		).toBe(1);
	});

	it("resumes an in-progress round from answeredCount + 1", () => {
		expect(
			getSessionCurrentCardNumber({
				answeredCount: 3,
				questionsPool: Array.from({ length: 12 }, (_, index) => ({
					id: index + 1,
					attributes: {} as never,
				})),
			})
		).toBe(4);
	});

	it("pins a completed round to 15 out of 15", () => {
		expect(
			getSessionCurrentCardNumber({
				answeredCount: 15,
				questionsPool: [],
			})
		).toBe(15);
	});

	it("computes the current top-card index from the remaining pool", () => {
		expect(
			getSessionCurrentIndex(
				Array.from({ length: 12 }, (_, index) => ({
					id: index + 1,
					attributes: {} as never,
				}))
			)
		).toBe(11);
	});

	it("increments local in-run progress without exceeding the round total", () => {
		expect(getNextCardNumber(1)).toBe(2);
		expect(getNextCardNumber(4)).toBe(5);
		expect(getNextCardNumber(15)).toBe(15);
	});

	it("keeps the visible counter anchored to the fixed round total", () => {
		expect(getDisplayedCardCounter(4, 12)).toBe(4);
		expect(getDisplayedCardCounter(15, 0)).toBe(15);
	});
});

