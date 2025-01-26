import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface payload {
	userId: number;
	name: string;
	selectedColor: string | number;
	authToken: string;
	modalType: "new" | "edit";
	playlistId: number;
}

interface SuccessResponse {
	data: {
		userId: number;
		name: string;
	};
}

// Custom hook to add page metrics
export const useCreateNewPlaylist = (
	onSuccess: (data: any, message: string) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<
		SuccessResponse & { message: string },
		AxiosError,
		payload
	>({
		mutationFn: async ({
			userId,
			name,
			selectedColor,
			authToken,
			modalType,
			playlistId,
		}: payload) => {
			let method: string;
			let url: string;
			let message: string;

			if (modalType === "new") {
				method = "POST";
				url = `${process.env.EXPO_PUBLIC_API_URL}/playlists`;
				message = "La playlist a été créée";
			} else {
				method = "PUT";
				url = `${process.env.EXPO_PUBLIC_API_URL}/playlists/${playlistId}`;
				message = "La playlist a été modifiée";
			}

			try {
				const response: AxiosResponse<SuccessResponse> = await axios({
					method: method,
					url: url,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
					data: {
						data: {
							userId,
							name,
							selectedColor,
						},
					},
				});

				// Return response along with the message
				return { ...response.data, message };
			} catch (error: any) {
				console.error(
					`Error creating the new playlist : ${name} : `,
					error.response ? error.response.data : error.message
				);
				throw error;
			}
		},
		onSuccess: (data) => {
			// Extract and pass message to onSuccess
			const { message, ...responseData } = data;
			onSuccess(responseData, message);
		},
		onError,
	});
};
