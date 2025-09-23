// File: src/hooks/Game/useGameQuestions.ts
import { QK } from "@/helpers/api/queryKeys";
import { GameQuestionsResponse } from "@/types/userGameSessionStatus";
import { useQuery } from "@tanstack/react-query";

export interface GameQuestions {
	data: GameQuestionsResponse;
}

const authFrom = (token?: string | null) => (token ? `Bearer ${token}` : "");

const fetchAllQuestions = async (
	auth: string,
	userId: number
): Promise<GameQuestions> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}`,
		{ headers: { Authorization: auth, Accept: "application/json" } }
	);
	if (!res.ok) {
		const text = await res.text();
		console.error(
			"[useGameQuestions] fetchAllQuestions error",
			res.status,
			text
		);
		throw new Error(`HTTP ${res.status}`);
	}
	return (await res.json()) as GameQuestions;
};

const fetchQuestionsByCat = async (
	auth: string,
	userId: number,
	categoryId: number
): Promise<GameQuestions> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}/category/${categoryId}`,
		{ headers: { Authorization: auth, Accept: "application/json" } }
	);
	if (!res.ok) {
		const text = await res.text();
		console.error(
			"[useGameQuestions] fetchQuestionsByCat error",
			res.status,
			text
		);
		throw new Error(`HTTP ${res.status}`);
	}
	return (await res.json()) as GameQuestions;
};

/**
 * Pass token + loading from the parent. We won't fire until token is ready.
 */
export const useGameQuestions = (
	userId: number,
	filterByCat: number | null,
	token: string | null,
	loadingToken: boolean
) => {
	const auth = authFrom(token);
	const enabled = !!userId && !!auth && !loadingToken; // <-- gate query until JWT exists

	return useQuery<GameQuestions>({
		queryKey: QK.gameQuestions(userId, filterByCat),
		enabled,
		queryFn: () =>
			filterByCat !== null
				? fetchQuestionsByCat(auth, userId, filterByCat)
				: fetchAllQuestions(auth, userId),
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		retry: (failures, err: any) => {
			const msg = String(err?.message || "");
			if (msg.includes("HTTP 401") || msg.includes("HTTP 403")) return false;
			return failures < 2;
		},
	});
};
