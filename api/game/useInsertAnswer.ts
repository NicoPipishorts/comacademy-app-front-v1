// src/api/game/useInsertAnswer.ts
import {
	invalidateGameResults,
} from "@/api/game/invalidateGameQueries";
import useJwtToken from "@/hooks/useJwtToken";
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

		onSettled: (_res, _err, vars) => {
			void invalidateGameResults(queryClient, vars.userId, vars.gameId);
		},
	});
}
