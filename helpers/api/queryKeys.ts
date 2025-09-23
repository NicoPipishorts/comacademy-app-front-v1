export const QK = {
	gameSession: (sessionId: number) => ["game-session", sessionId] as const,
	gameQuestions: (userId: number, cat: number | null) =>
		["game-questions", userId, cat ?? "all"] as const,
};
