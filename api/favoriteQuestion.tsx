import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface AddFavoriteQuestionPayload {
	userId: number;
	questionId: number;
}

interface FavoriteQuestionResponse {
	data: any; // Adjust based on your response structure
}

// Custom hook to add favorite question
export const useAddFavoriteQuestionMutation = (
	onSuccess: (data: FavoriteQuestionResponse) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<
		FavoriteQuestionResponse,
		AxiosError,
		AddFavoriteQuestionPayload
	>({
		mutationFn: async ({ userId, questionId }: AddFavoriteQuestionPayload) => {
			const { token } = useJwtToken();
			if (!token) {
				throw new Error("No JWT token found in storage");
			}

			const payload = {
				data: {
					questions: questionId,
				},
			};

			const response: AxiosResponse<FavoriteQuestionResponse> = await axios.put(
				`${process.env.EXPO_PUBLIC_API_URL}/favorite-questions/${userId}`,
				payload,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);
			return response.data; // Extract and return the data
		},
		onSuccess: (data) => {
			onSuccess(data); // Call the original onSuccess callback
		},
		onError,
	});
};
function useJwtToken(): { token: any; loading: any } {
	throw new Error("Function not implemented.");
}
