import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface payload {
	playlistId: number;
	elementId: number;
	type: string;
	authToken: string;
}

interface SuccessResponse {
	data: {
		id: number;
	};
}

// Custom hook to add page metrics
export const useAddToPlaylist = (
	onSuccess: (data: any) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<SuccessResponse, AxiosError, payload>({
		mutationFn: async ({ playlistId, elementId, type, authToken }: payload) => {
			const payload = () => {
				switch (type) {
					case "question":
						return {
							data: {
								playlistId: playlistId,
								question: elementId,
								active: true,
							},
						};
					case "metier":
						return {
							data: {
								playlistId: playlistId,
								metier: elementId,
								active: true,
							},
						};
					case "dico":
						return {
							data: {
								playlistId: playlistId,
								dico: elementId,
								active: true,
							},
						};
					default:
						throw new Error("Invalid type");
				}
			};

			try {
				const response: AxiosResponse<SuccessResponse> = await axios({
					method: "POST",
					url: `${process.env.EXPO_PUBLIC_API_URL}/playlist-contents`,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`, // Authorization token
					},
					data: payload(),
				});

				return response.data;
			} catch (error: any) {
				console.error(
					`Error creating the new playlist: `,
					error.response ? error.response.data : error.message
				);
				throw error;
			}
		},
		onSuccess,
		onError,
	});
};
