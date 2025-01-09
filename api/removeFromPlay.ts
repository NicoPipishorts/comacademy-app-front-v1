import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface payload {
	elementId: number;
	authToken: string;
}

interface SuccessResponse {
	data: {
		id: number;
	};
}

// Custom hook to add page metrics
export const useRemoveFromPlaylist = (
	onSuccess: (data: any) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<SuccessResponse, AxiosError, payload>({
		mutationFn: async ({ elementId, authToken }: payload) => {
			try {
				const response: AxiosResponse<SuccessResponse> = await axios({
					method: "DELETE",
					url: `${process.env.EXPO_PUBLIC_API_URL}/playlist-contents/${elementId}`,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
				});

				return response.data;
			} catch (error: any) {
				console.error(
					`Error deleting the element from the playlist: `,
					error.response ? error.response.data : error.message
				);
				throw error;
			}
		},
		onSuccess,
		onError,
	});
};
