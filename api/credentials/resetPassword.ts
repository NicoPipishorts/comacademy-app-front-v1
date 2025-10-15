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
			if (!resetPasswordUrl) {
				throw new Error(
					"EXPO_PUBLIC_RESET_PASSWORD_URL is not configured. Unable to finalise password reset."
				);
			}

			try {
				const response: AxiosResponse<ResetPasswordResponse> = await axios.post(
					resetPasswordUrl,
					payload
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
