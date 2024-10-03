import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface PasswordChangeVariables {
	currentPassword: string | number;
	password: string | number;
	passwordConfirmation: string | number;
	token: string;
}

interface FavoritesMetierResponse {
	data: any;
}

// Custom hook to handle password change
export const usePasswordChange = (
	onSuccess: (data: FavoritesMetierResponse) => void,
	onError: (message: string) => void
) => {
	return useMutation<
		FavoritesMetierResponse,
		AxiosError,
		PasswordChangeVariables
	>({
		mutationFn: async ({
			currentPassword,
			password,
			passwordConfirmation,
			token,
		}: PasswordChangeVariables) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/auth/change-password`;

			try {
				const response: AxiosResponse<FavoritesMetierResponse> = await axios({
					method: "POST",
					url: url,
					data: {
						currentPassword,
						password,
						passwordConfirmation,
					},
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					// Axios error handling
					throw error;
				} else if (error instanceof Error) {
					// Non-Axios error handling (for any other error type)
					throw new Error(error.message);
				} else {
					throw new Error("An unexpected error occurred");
				}
			}
		},
		onSuccess: (data) => {
			onSuccess(data); // Call the provided onSuccess callback
		},
		onError: (error: AxiosError | Error) => {
			if (axios.isAxiosError(error)) {
				onError("Une erreur c'est produite. Re essaye plus tard.");
			}
		},
	});
};
