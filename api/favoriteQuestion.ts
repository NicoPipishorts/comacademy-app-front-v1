import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface AddFavoriteQuestionPayload {
	dataId?: number;
	userId?: number;
	updatedFavoriteQuestions: number[];
	token: string;
}

interface FavoriteQuestionResponse {
	data: any;
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
			dataId,
			updatedFavoriteQuestions,
			token,
		}: AddFavoriteQuestionPayload) => {
			// Check if the user already has favorite questions

			// Decide between POST or PUT
			let method: string;
			let url: string;
			let payload: { data: { questions: number[]; userId?: number } };
			if (!dataId) {
				method = "POST";
				url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-questions/`;
				payload = {
					data: {
						questions: updatedFavoriteQuestions,
						userId,
					},
				};
			} else {
				method = "PUT";
				url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-questions/${dataId}`;
				payload = {
					data: {
						questions: updatedFavoriteQuestions,
					},
				};
			}

			try {
				const response: AxiosResponse<FavoriteQuestionResponse> = await axios({
					method: method,
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
				console.error(
					"Error code of something going wrong:",
					error.response.status
				);
			}
		},
	});
};
