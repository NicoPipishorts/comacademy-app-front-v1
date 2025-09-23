import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

// Payload & response types for feedback
interface SendFeedbackVariables {
	userId: number;
	subject: string;
	message: string;
}
interface SendFeedbackResponse {
	success: boolean;
	message: string;
}

export const useSendFeedback = (
	onSuccess: (data: SendFeedbackResponse) => void,
	onError: (message: string) => void
) => {
	return useMutation<SendFeedbackResponse, Error, SendFeedbackVariables>({
		mutationFn: async ({ userId, subject, message }) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/feedback`;
			try {
				const res: AxiosResponse<SendFeedbackResponse> = await axios.post(
					url,
					{ userId, subject, message },
					{ headers: { "Content-Type": "application/json" } }
				);
				return res.data;
			} catch (err) {
				console.error("Feedback mutation error:", err);
				if (axios.isAxiosError(err)) {
					// log the full response for debugging
					console.error("Server response data:", err.response?.data);
					const serverMsg =
						// Strapi’s badRequest error comes in err.response.data.error.message
						(err.response?.data as any)?.message ??
						(err.response?.data as any)?.error?.message ??
						"Une erreur s'est produite. Réessayez plus tard.";
					throw new Error(serverMsg);
				}
				// non‑Axios error
				throw new Error("Une erreur inattendue s'est produite.");
			}
		},
		onSuccess: (data) => {
			onSuccess(data);
		},
		onError: (error) => {
			// always an Error here, so error.message is safe
			onError(error.message);
		},
	});
};
