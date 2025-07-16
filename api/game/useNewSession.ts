// File: src/hooks/useSessionAction.ts
import { queryClient } from "@/hooks/reactQueryConfig";
import { QuestionData } from "@/types/userGameSessionStatus";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export type SessionAction = "new" | "end";

export interface SessionActionPayload {
	userId: number;
	token: string;
	action: SessionAction;
}

export interface SessionActionResponse {
	data: {
		sessionId: number;
		isNewSession: boolean;
		answeredCount: number;
		questionsLeft: number;
		status: "in_progress" | "finished";
		questionsPool: QuestionData[];
	};
}

export const useSessionAction = (
	onSuccess: (
		payload: SessionActionResponse["data"],
		action: SessionAction
	) => void,
	onError: (err: AxiosError) => void
) => {
	return useMutation<SessionActionResponse, AxiosError, SessionActionPayload>({
		mutationFn: async ({ userId, token, action }) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}/new`;
			const response: AxiosResponse<SessionActionResponse> = await axios.post(
				url,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			return response.data;
		},
		onSuccess: (resp, vars) => {
			queryClient.refetchQueries({ queryKey: ["UserGameSessionStatus"] });
			onSuccess(resp.data, vars.action);
		},
		onError,
	});
};
