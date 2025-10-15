import { AuthResponse } from "@/types/credentials/auth";
import { FormPayload } from "@/screens/Register/Register";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export const useRegisterNewUser = (
	onSuccess: (data: AuthResponse) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<AuthResponse, AxiosError, FormPayload>({
		mutationFn: async (formPayload: FormPayload) => {
			try {
				const response: AxiosResponse<AuthResponse> = await axios.post(
					process.env.EXPO_PUBLIC_REGISTER_URL,
					{ ...formPayload, confirmed: true }
				);
				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					const errorMessage = error.response?.data?.error?.message;
					throw new Error(errorMessage);
				}
				throw error;
			}
		},
		onSuccess: (data: AuthResponse) => {
			onSuccess(data);
		},
		onError: (error) => {
			console.error("Registration failed:", error);
			onError(error);
		},
	});
};
