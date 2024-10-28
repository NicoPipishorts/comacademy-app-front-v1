import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface SavePushTokenPayload {
	token: string;
	userId: number;
	authToken: string;
}

interface SuccessResponse {
	message: string;
}

// Custom hook to save the push token
export const useSavePushToken = (
	onSuccess: (data: any) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<SuccessResponse, AxiosError, SavePushTokenPayload>({
		mutationFn: async ({ token, userId, authToken }: SavePushTokenPayload) => {
			const payload = {
				token,
				userId,
			};

			try {
				const response: AxiosResponse<SuccessResponse> = await axios({
					method: "POST",
					url: `${process.env.EXPO_PUBLIC_API_URL}/save-token`,
					data: payload,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
				});

				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.error("Error response from server:", error.response?.data);
					console.error("HTTP status:", error.response?.status);
				} else {
					console.error("Unexpected error:", error);
				}
				throw error;
			}
		},
		onSuccess,
		onError,
	});
};
