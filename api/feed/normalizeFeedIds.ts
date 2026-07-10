export const normalizeFeedIds = (feedIds: number[]): number[] =>
	Array.from(
		new Set(
			feedIds
				.map((value) => Number(value))
				.filter((value) => Number.isInteger(value) && value > 0)
		)
	);
