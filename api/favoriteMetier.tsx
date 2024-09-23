import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface AddFavoriteMetiers {
	dataId?: number;
	userId?: number;
	updatedFavoriteMetiers: number[];
	token: string;
}

interface FavoritesMetierResponse {
	data: any;
}

// Custom hook to add favorite question
export const useAddFavoritesMetierMutation = (
	onSuccess: (data: FavoritesMetierResponse) => void
) => {
	return useMutation<FavoritesMetierResponse, AxiosError, AddFavoriteMetiers>({
		mutationFn: async ({
			userId,
			dataId,
			updatedFavoriteMetiers,
			token,
		}: AddFavoriteMetiers) => {
			let method: string;
			let url: string;
			let payload: { data: { metiers: number[]; userId?: number } };
			if (!dataId) {
				method = "POST";
				url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-metiers/`;
				payload = {
					data: {
						metiers: updatedFavoriteMetiers,
						userId,
					},
				};
			} else {
				method = "PUT";
				url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-metiers/${dataId}`;
				payload = {
					data: {
						metiers: updatedFavoriteMetiers,
					},
				};
			}

			try {
				const response: AxiosResponse<FavoritesMetierResponse> = await axios({
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
				console.error("Error code:", error.response.status);
			}
		},
	});
};
