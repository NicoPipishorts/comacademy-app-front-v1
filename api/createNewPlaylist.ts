import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface payload {
	userId: number;
	name: string;
	authToken: string;
}

interface SuccessResponse {
	data: {
		userId: number;
		name: string;
	};
}

// Custom hook to add page metrics
export const useCreateNewPlaylist = (
	onSuccess: (data: any) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<SuccessResponse, AxiosError, payload>({
		mutationFn: async ({ userId, name, authToken }: payload) => {
			try {
				const response: AxiosResponse<SuccessResponse> = await axios({
					method: "POST",
					url: `${process.env.EXPO_PUBLIC_API_URL}/playlists`,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`, // Authorization token
					},
					data: {
						data: {
							userId,
							name,
						},
					},
				});

				return response.data;
			} catch (error: any) {
				console.error(
					`Error creating the new playlist : ${name} : `,
					error.response ? error.response.data : error.message
				);
				throw error;
			}
		},
		onSuccess,
		onError,
	});
};
