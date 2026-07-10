import { invalidateGameQuestions } from "@/api/game/invalidateGameQueries";
import { queryClient } from "@/hooks/reactQueryConfig";
import { QuestionData } from "@/types/userGameSessionStatus";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export interface NewSessionPayload {
	userId: number;
	token: string;
	sessionId?: number | null;
}

export interface NewSessionResponse {
	data: {
		sessionId: number;
		isNewSession: boolean;
		answeredCount: number;
		questionsLeft: number;
		status: "in_progress" | "finished";
		questionsPool: QuestionData[];
	};
}

export const useNewSession = (
	onSuccess: (payload: NewSessionResponse["data"]) => void,
	onError: (err: AxiosError) => void,
) => {
	return useMutation<NewSessionResponse, AxiosError, NewSessionPayload>({
		mutationFn: async ({ userId, token, sessionId }) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}/new`;
			const response: AxiosResponse<NewSessionResponse> = await axios.post(
				url,
				{ sessionId: sessionId ?? undefined },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			return response.data;
		},
		onSuccess: async (resp, vars) => {
			await invalidateGameQuestions(queryClient, vars.userId);
			onSuccess(resp.data);
		},
		onError,
	});
};
