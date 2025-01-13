import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface payload {
	elementId: number;
	userId: number;
	authToken: string;
}

interface SuccessResponse {
	data: {
		id: number;
	};
}

// Custom hook to add page metrics
export const useLikePost = (onSuccess: (data: any) => void) => {
	return useMutation<SuccessResponse, AxiosError, payload>({
		mutationFn: async ({ elementId, userId, authToken }: payload) => {
			try {
				const response: AxiosResponse<SuccessResponse> = await axios({
					method: "PUT",
					url: `${process.env.EXPO_PUBLIC_API_URL}/feed/${elementId}/like`,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
					data: {
						userId,
					},
				});

				return response.data;
			} catch (error: any) {
				console.error(
					`Error liking the post: ${elementId} : `,
					error.response ? error.response.data : error.message
				);
				throw error;
			}
		},
		onSuccess,
	});
};
