// File: src/hooks/useFinishGameSession.ts

import { queryClient } from "@/hooks/reactQueryConfig";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export interface FinishSessionPayload {
	userId: number;
	token: string;
	action: "end" | "new";
}

export interface SuccessPayload {
	data: {
		success: boolean;
		sessionId: number | null;
		message?: string;
		status?: string;
	};
}

export const useFinishGameSession = (
	onSuccess: (data: SuccessPayload["data"], action: "end" | "new") => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<SuccessPayload, AxiosError, FinishSessionPayload>({
		mutationFn: async ({ userId, token, action }) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}/${action}`;
			const response: AxiosResponse<SuccessPayload> = await axios.post(
				url,
				{}, // no body
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);
			return response.data;
		},
		onSuccess: (resp, vars) => {
			// Invalidate session-status so the next UI read sees the new state
			queryClient.invalidateQueries({ queryKey: ["UserGameSessionStatus"] });
			onSuccess(resp.data, vars.action);
		},
		onError: (error) => {
			console.error(
				"Error finishing session:",
				error.response?.status,
				error.message
			);
			onError(error);
		},
	});
};
