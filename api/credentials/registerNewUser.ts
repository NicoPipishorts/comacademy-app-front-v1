import { FormPayload } from "@/screens/Register/Register";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export interface RegisterPayload {
	jwt: string;
}

export const useRegisterNewUser = (
	onSuccess: (data: RegisterPayload) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<RegisterPayload, AxiosError, FormPayload>({
		mutationFn: async (formPayload: FormPayload) => {
			try {
				const response: AxiosResponse<RegisterPayload> = await axios.post(
					process.env.EXPO_PUBLIC_REGISTER_URL, // Update the URL to your actual Strapi endpoint
					{ ...formPayload, confirmed: true } // Send the formPayload as the request body
				);
				return response.data; // Extract and return the response data
			} catch (error) {
				if (axios.isAxiosError(error)) {
					const errorMessage = error.response?.data?.error?.message;
					throw new Error(errorMessage); // Pass the error message to the caller
				}
				throw error;
			}
		},
		onSuccess: async (data: RegisterPayload) => {
			try {
				// Store the JWT token in AsyncStorage
				await AsyncStorage.setItem("jwtToken", data.jwt);
				onSuccess(data); // Call the provided onSuccess callback
			} catch (storageError) {
				console.error("Failed to save the token to storage", storageError);
				throw new Error("Failed to save the token to storage");
			}
		},
		onError: (error) => {
			console.error("Registration failed:", error);
			onError(error); // Call the provided onError callback
		},
	});
};
