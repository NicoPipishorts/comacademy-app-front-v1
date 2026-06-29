export const QK = {
	gameQuestionsRoot: (userId?: number) =>
		userId ? (["game-questions", userId] as const) : (["game-questions"] as const),
	gameSession: (sessionId: number) => ["game-session", sessionId] as const,
	gameQuestions: (
		userId: number,
		cat: number | null,
		createIfMissing = false
	) => ["game-questions", userId, cat ?? "all", createIfMissing ? "create" : "read"] as const,
	parcoursGameQuestions: (
		userId: number,
		categoryId: number,
		questionCount: number,
		sessionId?: number | null
	) =>
		["parcours-game-questions", userId, categoryId, questionCount, sessionId ?? "new"] as const,
	endOfSession: (userId: number) => ["end-of-session", userId] as const,
	endOfSessionResults: (gameId: number) =>
		["end-of-session-results", gameId] as const,
	parcoursTimeline: () => ["parcours", "timeline"] as const,
	parcoursBonuses: () => ["parcours", "bonuses"] as const,
	parcoursWeek: (weekId: number) => ["parcours", "week", weekId] as const,
	parcoursDay: (dayId: number) => ["parcours", "day", dayId] as const,
};
