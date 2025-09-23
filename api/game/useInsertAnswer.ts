// src/api/game/useInsertAnswer.ts
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
};

export function useInsertAnswer() {
	const queryClient = useQueryClient();
	const { token } = useJwtToken();
	const { setQuestionsLeft } = useGameContext();

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
		},

		onError: () => {
			// rollback the counter only (we didn't change dataGame)
			setQuestionsLeft?.((n) => (typeof n === "number" ? n + 1 : n));
		},

		onSettled: (_res, _err, vars) => {
			// Reconcile with server; safe because we didn't mutate dataGame mid-swipe
			queryClient.invalidateQueries({
				queryKey: ["game-session", vars.gameId],
			});
		},
	});
}
