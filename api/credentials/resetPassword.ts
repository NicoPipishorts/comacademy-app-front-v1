import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getResetPasswordUrl } from "@/helpers/api/buildApiUrl";

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
	resetPasswordUrl: string,
	onSuccess: (data: ResetPasswordResponse) => void,
	onError: (error: AxiosError | Error) => void
) => {
	return useMutation<
		ResetPasswordResponse,
		AxiosError | Error,
		ResetPasswordPayload
	>({
		mutationFn: async (payload) => {
			try {
				const response: AxiosResponse<ResetPasswordResponse> = await axios.post(
					resetPasswordUrl || getResetPasswordUrl(),
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
