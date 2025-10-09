import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

interface ForgotPasswordPayload {
	email: string;
}

interface ForgotPasswordResponse {
	ok: boolean;
	message?: string;
}

export const useForgotPasswordMutation = (
	forgotPasswordUrl: string | undefined,
	onSuccess: (data: ForgotPasswordResponse) => void,
	onError: (error: AxiosError | Error) => void
) => {
	return useMutation<
		ForgotPasswordResponse,
		AxiosError | Error,
		ForgotPasswordPayload
	>({
		mutationFn: async ({ email }) => {
			if (!forgotPasswordUrl) {
				throw new Error(
					"EXPO_PUBLIC_FORGOT_PASSWORD_URL is not configured. Unable to trigger password reset."
				);
			}

			try {
				const response: AxiosResponse<ForgotPasswordResponse> = await axios.post(
					forgotPasswordUrl,
					{ email }
				);
				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					const backendMessage =
						error.response?.data?.error?.message ?? error.message;
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
