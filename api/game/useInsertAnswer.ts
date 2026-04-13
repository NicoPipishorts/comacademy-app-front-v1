// src/api/game/useInsertAnswer.ts
import {
	invalidateGameQuestions,
	invalidateGameResults,
} from "@/api/game/invalidateGameQueries";
import { QK } from "@/helpers/api/queryKeys";
import useJwtToken from "@/hooks/useJwtToken";
import { useGameContext } from "@/providers/gameDataContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Vars = {
	gameId: number;
	userId: number;
	questionId: number;
	categorie: number;
	answer: boolean;
	categoryFilter?: number | null;
};

export function useInsertAnswer() {
	const queryClient = useQueryClient();
	const { token } = useJwtToken();
	const { setQuestionsLeft, setAnsweredCount } = useGameContext();

	return useMutation({
		mutationFn: async ({
			gameId,
			userId,
			questionId,
			categorie,
			answer,
		}: Vars) => {
			if (!token) throw new Error("No JWT token");
			const auth = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
			const url = `${process.env.EXPO_PUBLIC_API_URL}/game-questions/submit`;
			const payload = {
				data: { gameId, userId, questionId, categorie, answer },
			};
			const { data } = await axios.post(url, payload, {
				headers: { "Content-Type": "application/json", Authorization: auth },
			});
			return data;
		},

		// Optional: keep a live counter without touching dataGame
		onMutate: () => {
			setQuestionsLeft?.((n) =>
				typeof n === "number" ? Math.max(0, n - 1) : n
			);
			setAnsweredCount?.((n) => n + 1);
		},

		onError: () => {
			// rollback the counter only (we didn't change dataGame)
			setQuestionsLeft?.((n) => (typeof n === "number" ? n + 1 : n));
			setAnsweredCount?.((n) => Math.max(0, n - 1));
		},

		onSettled: (_res, _err, vars) => {
			void invalidateGameQuestions(queryClient, vars.userId);
			if (typeof vars.categoryFilter === "number") {
				void queryClient.invalidateQueries({
					queryKey: QK.gameQuestions(vars.userId, vars.categoryFilter),
				});
			}
			void invalidateGameResults(queryClient, vars.userId, vars.gameId);
		},
	});
}
