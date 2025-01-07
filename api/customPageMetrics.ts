import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface PageMetricsPayload {
	page: string; // Page name
	authToken: string; // Authorization token (JWT)
}

interface SuccessResponse {
	message: string;
	data: {
		id: number;
		Page: string;
		Count: number;
		createdAt: string;
		updatedAt: string;
		publishedAt: string | null;
	};
}

// Custom hook to add page metrics
export const useCustomPageMetrics = (
	onSuccess: (data: any) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<SuccessResponse, AxiosError, PageMetricsPayload>({
		mutationFn: async ({ page, authToken }: PageMetricsPayload) => {
			try {
				const response: AxiosResponse<SuccessResponse> = await axios({
					method: "POST",
					url: `${process.env.EXPO_PUBLIC_API_URL}/custom-metrics/page-metrics/${page}`,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`, // Authorization token
					},
				});

				return response.data;
			} catch (error: any) {
				console.error(
					"Error sending page metrics:",
					error.response ? error.response.data : error.message
				);
				throw error;
			}
		},
		onSuccess,
		onError,
	});
};
