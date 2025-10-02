// src/hooks/auth/useLoginMutation.ts
import { AuthResponse } from "@/types/credentials/auth";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

interface Credentials {
	identifier: string;
	password: string;
}

export const useLoginMutation = (
	authUrl: string,
	onSuccess: (data: AuthResponse) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<AuthResponse, AxiosError, Credentials>({
		mutationFn: async (credentials: Credentials) => {
			const response: AxiosResponse<AuthResponse> = await axios.post(
				authUrl,
				credentials
			);
			return response.data;
		},
	onSuccess: (data: AuthResponse) => {
		onSuccess(data);
	},
		onError,
	});
};
