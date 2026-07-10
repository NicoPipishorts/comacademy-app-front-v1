export const QUESTIONS_PER_ROUND = 15;
export const ROUNDS_PER_LEVEL = 10;
export const QUESTIONS_PER_LEVEL = QUESTIONS_PER_ROUND * ROUNDS_PER_LEVEL;

export function getGameLevel(totalAnsweredQuestions: number) {
	return Math.floor(totalAnsweredQuestions / QUESTIONS_PER_LEVEL);
}

export function getRoundProgress(totalAnsweredQuestions: number) {
	const roundedRoundCount = Math.round(
		totalAnsweredQuestions / QUESTIONS_PER_ROUND,
	);

	return {
		roundedRoundCount,
		roundsPlayedInLevel: roundedRoundCount % ROUNDS_PER_LEVEL,
		level: getGameLevel(totalAnsweredQuestions),
	};
}
