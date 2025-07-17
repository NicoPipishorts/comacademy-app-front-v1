// File: src/hooks/Game/useGameQuestions.ts

import useJwtToken from "@/hooks/useJwtToken";
import { GameQuestionsResponse } from "@/types/userGameSessionStatus";
import { useQuery } from "@tanstack/react-query";

export interface GameQuestions {
	data: GameQuestionsResponse;
}

const fetchAllQuestions = async (
	token: string,
	userId: number
): Promise<GameQuestions> => {
	console.log("[useGameQuestions] → fetchAllQuestions()", { userId });
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}`,
		{ headers: { Authorization: `Bearer ${token}` } }
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
	const payload = (await res.json()) as GameQuestions;
	console.log(
		"[useGameQuestions] fetchAllQuestions success",
		payload.data.questionsPool[0].id
	);
	return payload;
};

const fetchQuestionsByCat = async (
	token: string,
	userId: number,
	categoryId: number
): Promise<GameQuestions> => {
	console.log("[useGameQuestions] → fetchQuestionsByCat()", {
		userId,
		categoryId,
	});
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}/category/${categoryId}`,
		{ headers: { Authorization: `Bearer ${token}` } }
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
	const payload = (await res.json()) as GameQuestions;
	console.log(
		"[useGameQuestions] fetchQuestionsByCat success",
		payload.data.questionsPool[0].id
	);
	return payload;
};

export const useGameQuestions = (
	userId: number,
	filterByCat: number | null
) => {
	const { token, loading } = useJwtToken();

	return useQuery<GameQuestions>({
		// include both userId & filterByCat in the key
		queryKey: ["GameQuestions", userId, filterByCat],
		queryFn: () => {
			console.log("[useGameQuestions] queryFn fired", { filterByCat });
			return filterByCat !== null
				? fetchQuestionsByCat(token!, userId, filterByCat)
				: fetchAllQuestions(token!, userId);
		},
		enabled: !loading && !!token && !!userId,
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: false,
	});
};
