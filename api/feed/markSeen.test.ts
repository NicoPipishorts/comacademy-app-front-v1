import { normalizeFeedIds } from "./normalizeFeedIds";

describe("normalizeFeedIds", () => {
	it("keeps only unique positive integer feed ids", () => {
		expect(normalizeFeedIds([1, 2, 2, 0, -1, 3.5, Number.NaN])).toEqual([
			1,
			2,
		]);
	});

	it("normalizes numeric values before sending them to the API", () => {
		expect(normalizeFeedIds(["3" as unknown as number, 3, 4])).toEqual([
			3,
			4,
		]);
	});
});
