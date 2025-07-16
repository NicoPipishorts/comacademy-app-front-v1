// File: src/hooks/useInsertAnswer.ts

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export interface CreateNewGameSession {
	gameId: number;
	userId: number;
	questionId: number;
	categorie: number;
	answer: boolean;
	token: string;
}

interface NewSessionResponse {
	data: any;
}

export const InsertAnswer = () => {
	return useMutation<NewSessionResponse, AxiosError, CreateNewGameSession>({
		mutationFn: async (vars) => {
			const { gameId, userId, questionId, categorie, answer, token } = vars;
			const payload = {
				data: { gameId, userId, questionId, categorie, answer },
			};
			const url = `${process.env.EXPO_PUBLIC_API_URL}/game-questions`;

			const response: AxiosResponse<NewSessionResponse> = await axios.post(
				url,
				payload,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			return response.data;
		},
		onSuccess: () => {
			// queryClient.invalidateQueries({ queryKey: ["UserGameSessionStatus"] });
		},
		onError: (error) => {
			console.error("❌ Mutation failed:", error);
		},
	});
};
