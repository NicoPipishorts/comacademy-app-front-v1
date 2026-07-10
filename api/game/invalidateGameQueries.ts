import { QK } from "@/helpers/api/queryKeys";
import type { QueryClient } from "@tanstack/react-query";

export function invalidateGameQuestions(
	queryClient: QueryClient,
	userId?: number | null,
) {
	if (!userId) return Promise.resolve();
	return queryClient.invalidateQueries({
		queryKey: QK.gameQuestionsRoot(userId),
	});
}

export function invalidateGameResults(
	queryClient: QueryClient,
	userId?: number | null,
	gameId?: number | null,
) {
	const tasks: Promise<unknown>[] = [];

	if (userId) {
		tasks.push(
			queryClient.invalidateQueries({
				queryKey: QK.endOfSession(userId),
			}),
		);
	}

	if (gameId) {
		tasks.push(
			queryClient.invalidateQueries({
				queryKey: QK.endOfSessionResults(gameId),
			}),
		);
	}

	return Promise.all(tasks);
}
