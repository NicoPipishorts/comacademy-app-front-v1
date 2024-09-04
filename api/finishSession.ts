import { queryClient } from "@/hooks/reactQueryConfig";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface FinishSessionPayload {
	sessionId: number;
	score: number;
	token: string; // Include token in the payload
}

interface SuccessPayload {
	data: any; // Adjust based on your response structure
}

// Custom hook to add favorite question
export const FinishGameSession = (
	onSuccess: (data: any) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<SuccessPayload, AxiosError, FinishSessionPayload>({
		mutationFn: async ({ sessionId, score, token }: FinishSessionPayload) => {
			const payload = {
				data: {
					score,
					inProgress: false,
				},
			};

			const url = `${process.env.EXPO_PUBLIC_API_URL}/game-sessions/${sessionId}`;

			try {
				const response: AxiosResponse<SuccessPayload> = await axios({
					method: "PUT",
					url: url,
					data: payload,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					throw error;
				} else {
					throw new Error("An unexpected error occurred");
				}
			}
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["GameSession"],
			});
			onSuccess(data); // Call the original onSuccess callback
		},
		onError: (error) => {
			if (error.response) {
				console.error("Error code:", error.response.status);
			}
			onError(error); // Call the original onError callback
		},
	});
};
