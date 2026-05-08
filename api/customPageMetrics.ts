import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
import { getApiBaseUrl } from "@/helpers/api/buildApiUrl";

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
			const sanitizedBase = getApiBaseUrl();
			const targetUrl = `${sanitizedBase}/custom-metrics/page-metrics/${encodeURIComponent(
				page
			)}`;

			try {
				const response: AxiosResponse<SuccessResponse> = await axios({
					method: "POST",
					url: targetUrl,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
					timeout: 5000,
					data: {},
				});

				return response.data;
			} catch (error: any) {
				if (isAxiosError(error)) {
					const payload = error.response?.data ?? error.message;
					console.error("Error sending page metrics:", payload);
					throw error;
				}

				console.error("Unexpected error sending page metrics:", error);
				throw new Error("Unexpected error while sending page metrics");
			}
		},
		onSuccess,
		onError,
	});
};
