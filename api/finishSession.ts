import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface AddFavoriteQuestionPayload {
	sessionId: number;
	score: number;
	token: string; // Include token in the payload
}

interface SuccessPayload {
	data: any; // Adjust based on your response structure
}

// Custom hook to add favorite question
export const FinishGameSession = (onError: (error: AxiosError) => void) => {
	return useMutation<SuccessPayload, AxiosError, AddFavoriteQuestionPayload>({
		mutationFn: async ({
			sessionId,
			score,
			token,
		}: AddFavoriteQuestionPayload) => {
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
		onError: (error) => {
			if (error.response) {
				console.error("Error code:", error.response.status);
			}
			onError(error); // Call the original onError callback
		},
	});
};
