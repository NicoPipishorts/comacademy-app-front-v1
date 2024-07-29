import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

interface Credentials {
	identifier: string;
	password: string;
}

interface LoginPayload {
	jwt: string;
	user: any; // Adjust the type based on your user object structure
}

export const useLoginMutation = (
	authUrl: string,
	onSuccess: (data: LoginPayload) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<LoginPayload, AxiosError, Credentials>({
		mutationFn: async (credentials: Credentials) => {
			const response: AxiosResponse<LoginPayload> = await axios.post(
				authUrl,
				credentials
			);
			return response.data; // Extract and return the data
		},
		onSuccess: async (data: LoginPayload) => {
			// Store the JWT token in AsyncStorage
			try {
				await AsyncStorage.setItem("jwtToken", data.jwt);
				onSuccess(data); // Call the original onSuccess callback
			} catch (error) {
				console.error("Failed to save the token to storage", error);
			}
		},
		onError,
	});
};
