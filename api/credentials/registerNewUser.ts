import { FormPayload } from "@/screens/Register/Register";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";

export interface RegisterPayload {
	jwt: string;
	user: {
		id: string;
		username: string;
		firstName: string;
		lastName: string;
		email: string;
		confirmed: boolean;
		blocked: boolean;
		clients: { nom: string }[]; // array of client objects with "nom"
		user_preference: {
			avatarBackgroundColor: string;
		} | null;
		profile: string | null; // profile key (string) or null if none
	};
}

export const useRegisterNewUser = (
	onSuccess: (data: RegisterPayload) => void,
	onError: (error: AxiosError) => void
) => {
	return useMutation<RegisterPayload, AxiosError, FormPayload>({
		mutationFn: async (formPayload: FormPayload) => {
			try {
				console.log(formPayload);
				const response: AxiosResponse<RegisterPayload> = await axios.post(
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
		onSuccess: async (data: RegisterPayload) => {
			try {
				// Decode the JWT token to extract the user ID
				const decodedToken = jwtDecode<JwtPayload & { id?: number }>(data.jwt);
				const userId = decodedToken?.id;

				// Store the JWT token and userId in AsyncStorage
				await AsyncStorage.multiSet([
					["jwtToken", data.jwt],
					["userId", userId?.toString() || ""],
				]);
				onSuccess(data);
			} catch (storageError) {
				console.error("Failed to save the data to storage", storageError);
				throw new Error("Failed to save the data to storage");
			}
		},
		onError: (error) => {
			console.error("Registration failed:", error);
			onError(error);
		},
	});
};
