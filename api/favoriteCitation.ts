import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Payload passed into the mutation
interface AddFavoriteCitations {
	dataId?: number; // ID of the favorite-citation row (for PUT)
	userId?: number; // User ID
	updatedFavoriteCitations: number[]; // List of citation IDs
	token: string;
}

// Response type from Strapi (simplified)
interface FavoritesCitationResponse {
	data: any;
}

export const useAddFavoriteCitation = (
	onSuccess: (data: FavoritesCitationResponse) => void
) => {
	return useMutation<
		FavoritesCitationResponse,
		AxiosError,
		AddFavoriteCitations
	>({
		mutationFn: async ({
			userId,
			dataId,
			updatedFavoriteCitations,
			token,
		}: AddFavoriteCitations) => {
			let method: "POST" | "PUT";
			let url: string;
			let payload: { data: { citations: number[]; userId?: number } };

			if (!dataId) {
				// Create a new favorite record
				method = "POST";
				url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-citations`;
				payload = {
					data: {
						citations: updatedFavoriteCitations,
						userId,
					},
				};
			} else {
				// Update an existing favorite record
				method = "PUT";
				url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-citations/${dataId}`;
				payload = {
					data: {
						citations: updatedFavoriteCitations,
					},
				};
			}

			try {
				const response: AxiosResponse<FavoritesCitationResponse> = await axios({
					method,
					url,
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
			onSuccess(data);
		},
		onError: (error) => {
			if (error.response) {
				console.error("Error code:", error.response.status);
			}
		},
	});
};
