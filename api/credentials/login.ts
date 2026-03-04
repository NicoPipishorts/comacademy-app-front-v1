// src/hooks/auth/useLoginMutation.ts
import { AuthResponse } from "@/types/credentials/auth";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { normalizeAuthResponse } from "@/helpers/strapi";

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
			const response = await axios.post(authUrl, credentials);
			return normalizeAuthResponse(response.data);
		},
	onSuccess: (data: AuthResponse) => {
		onSuccess(data);
	},
		onError,
	});
};
