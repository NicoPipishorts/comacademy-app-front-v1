import { queryClient } from "@/hooks/reactQueryConfig";
import { useGameContext } from "@/providers/gameDataContext";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export interface EndSessionPayload {
	userId: number;
	token: string;
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
	onError: (err: AxiosError) => void
) => {
	const {
		setDataGame,
		setSessionsId,
		setGameStatus,
		setQuestionsLeft,
		setAnsweredCount,
	} = useGameContext();
	return useMutation<EndResponse, AxiosError, EndSessionPayload>({
		mutationFn: async ({ userId, token }) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-game-session-status/${userId}/end`;
			const response: AxiosResponse<EndResponse> = await axios.post(
				url,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			return response.data;
		},
		onSuccess: (resp) => {
			onSuccess(resp.data.status);
			if (resp.data.status === "finished") {
				setDataGame([]);
				setSessionsId(null);
				setQuestionsLeft(null);
				setAnsweredCount(0);
				setGameStatus("finished");
			}
			queryClient.refetchQueries({ queryKey: ["GameQuestions"] });
		},
		onError,
	});
};
