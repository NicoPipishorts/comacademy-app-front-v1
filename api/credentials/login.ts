import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface Credentials {
	identifier: string;
	password: string;
}

interface LoginPayload {
	jwt: string;
	user: string; // Adjust the type based on your user object structure
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
			return response.data;
		},
		onSuccess: async (data: LoginPayload) => {
			try {
				// Decode the JWT token to extract the user ID
				const decodedToken = jwtDecode<JwtPayload & { id?: number }>(data.jwt);
				const userId = decodedToken?.id;

				// Store the JWT token and userId in AsyncStorage
				await AsyncStorage.multiSet([
					["jwtToken", data.jwt],
					["userId", userId?.toString() || ""],
				]);

				onSuccess(data); // Call the onSuccess callback
			} catch (error) {
				console.error("Failed to decode token or save data to storage", error);
			}
		},
		onError,
	});
};
