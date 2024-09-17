import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface AddFavoriteQuestionPayload {
	userId: number;
	updatedFavoriteQuestions: number[];
	token: string; // Include token in the payload
}

interface FavoriteQuestionResponse {
	data: any; // Adjust based on your response structure
}

// Custom hook to add favorite question
export const useAddFavoriteQuestionMutation = (
	onSuccess: (data: FavoriteQuestionResponse) => void
) => {
	return useMutation<
		FavoriteQuestionResponse,
		AxiosError,
		AddFavoriteQuestionPayload
	>({
		mutationFn: async ({
			userId,
			updatedFavoriteQuestions,
			token,
		}: AddFavoriteQuestionPayload) => {
			const payload = {
				data: {
					questions: updatedFavoriteQuestions,
				},
			};

			const url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-questions/${userId}`;

			try {
				const response: AxiosResponse<FavoriteQuestionResponse> = await axios({
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
			onSuccess(data); // Call the original onSuccess callback
		},
		onError: (error) => {
			if (error.response) {
				console.error("Error code:", error.response.status);
			}
		},
	});
};
