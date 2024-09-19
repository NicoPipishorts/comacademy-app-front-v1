import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface AddFavoriteQuestionPayload {
	userId: number;
	updatedFavoriteMetiers: number[];
	token: string; // Include token in the payload
}

interface FavoritesMetierResponse {
	data: any; // Adjust based on your response structure
}

// Custom hook to add favorite question
export const useAddFavoritesMetierMutation = (
	onSuccess: (data: FavoritesMetierResponse) => void
) => {
	return useMutation<
		FavoritesMetierResponse,
		AxiosError,
		AddFavoriteQuestionPayload
	>({
		mutationFn: async ({
			userId,
			updatedFavoriteMetiers,
			token,
		}: AddFavoriteQuestionPayload) => {
			const payload = {
				data: {
					metiers: updatedFavoriteMetiers,
				},
			};

			const url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-metiers/${userId}`;

			try {
				const response: AxiosResponse<FavoritesMetierResponse> = await axios({
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
