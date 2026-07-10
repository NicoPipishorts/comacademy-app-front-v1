import {
	invalidateGameQuestions,
	invalidateGameResults,
} from "@/api/game/invalidateGameQueries";
import { queryClient } from "@/hooks/reactQueryConfig";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export interface EndSessionPayload {
	userId: number;
	token: string;
	sessionId?: number | null;
}

interface EndResponse {
	data: {
		success: boolean;
		sessionId: number | null;
		message?: string;
		status?: "in_progress" | "finished";
	};
}

export const useEndSession = (
	onSuccess: (status: string | null) => void,
	onError: (err: AxiosError) => void,
) => {
	return useMutation<EndResponse, AxiosError, EndSessionPayload>({
		mutationFn: async ({ userId, token, sessionId }) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}/end`;
			const response: AxiosResponse<EndResponse> = await axios.post(
				url,
				{ sessionId: sessionId ?? undefined },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			return response.data;
		},
		onSuccess: (resp, vars) => {
			onSuccess(resp.data.status);
			void invalidateGameQuestions(queryClient, vars.userId);
			void invalidateGameResults(queryClient, vars.userId, resp.data.sessionId);
		},
		onError,
	});
};
