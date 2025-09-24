// src/hooks/auth/useLoginMutation.ts
import { AuthResponse } from "@/types/credentials/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
		onSuccess: async (data: AuthResponse) => {
			try {
				// Persist: full payload + quick-access jwt
				await AsyncStorage.multiSet([
					["auth", JSON.stringify(data)],
					["jwtToken", data.jwt],
				]);

				// Optional: set axios default header immediately
				axios.defaults.headers.common.Authorization = `Bearer ${data.jwt}`;

				onSuccess(data);
			} catch (err) {
				console.error("Failed to save auth to storage", err);
			}
		},
		onError,
	});
};
