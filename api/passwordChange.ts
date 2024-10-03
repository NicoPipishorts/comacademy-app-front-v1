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

// Custom hook to add favorite question
export const usePasswordChange = (
	onSuccess: (data: FavoritesMetierResponse) => void
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
			let url: string;
			url = `${process.env.EXPO_PUBLIC_API_URL}/auth/password-change`;

			try {
				const response: AxiosResponse<FavoritesMetierResponse> = await axios({
					method: "POST",
					url: url,
					data: {
						data: {
							currentPassword,
							password,
							passwordConfirmation,
						},
					},
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					throw error;
				} else {
					throw new Error("An unexpected error occurred");
				}
			}
		},
		onSuccess: (data) => {
			onSuccess(data); // Call the original onSuccess callback
		},
		onError: (error) => {
			if (error.response) {
				console.error("Error code:", error.response.status);
			}
		},
	});
};
