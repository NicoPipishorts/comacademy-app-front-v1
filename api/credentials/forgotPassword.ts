import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getForgotPasswordUrl } from "@/helpers/api/buildApiUrl";

interface ForgotPasswordPayload {
	email: string;
}

interface ForgotPasswordResponse {
	ok: boolean;
	message?: string;
}

export const useForgotPasswordMutation = (
	forgotPasswordUrl: string,
	onSuccess: (data: ForgotPasswordResponse) => void,
	onError: (error: AxiosError | Error) => void
) => {
	return useMutation<
		ForgotPasswordResponse,
		AxiosError | Error,
		ForgotPasswordPayload
	>({
		mutationFn: async ({ email }) => {
			try {
				const response: AxiosResponse<ForgotPasswordResponse> = await axios.post(
					forgotPasswordUrl || getForgotPasswordUrl(),
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
