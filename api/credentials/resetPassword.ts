import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

interface ResetPasswordPayload {
	code: string;
	password: string;
	passwordConfirmation: string;
}

interface ResetPasswordResponse {
	jwt?: string;
	user?: {
		id: number;
		username: string;
		email: string;
	};
	[key: string]: unknown;
}

export const useResetPasswordMutation = (
	resetPasswordUrl: string | undefined,
	onSuccess: (data: ResetPasswordResponse) => void,
	onError: (error: AxiosError | Error) => void
) => {
	return useMutation<
		ResetPasswordResponse,
		AxiosError | Error,
		ResetPasswordPayload
	>({
		mutationFn: async (payload) => {
			console.log("[Reset Password Mutation] Starting with URL:", resetPasswordUrl);
			console.log("[Reset Password Mutation] Payload:", { ...payload, password: "***", passwordConfirmation: "***" });

			if (!resetPasswordUrl) {
				console.log("[Reset Password Mutation] Error: URL not configured");
				throw new Error(
					"EXPO_PUBLIC_RESET_PASSWORD_URL is not configured. Unable to finalise password reset."
				);
			}

			try {
				console.log("[Reset Password Mutation] Making POST request...");
				const response: AxiosResponse<ResetPasswordResponse> = await axios.post(
					resetPasswordUrl,
					payload
				);
				console.log("[Reset Password Mutation] Success:", response.status);
				return response.data;
			} catch (error) {
				console.log("[Reset Password Mutation] Error occurred:", error);
				if (axios.isAxiosError(error)) {
					const backendMessage =
						error.response?.data?.error?.message ?? error.message;
					console.log("[Reset Password Mutation] Backend error:", backendMessage);
					console.log("[Reset Password Mutation] Status:", error.response?.status);
					console.log("[Reset Password Mutation] Data:", error.response?.data);
					error.message = backendMessage;
					throw error;
				}

				throw error;
			}
		},
		onSuccess,
		onError,
	});
};
