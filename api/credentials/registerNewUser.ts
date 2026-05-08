import { AuthResponse } from "@/types/credentials/auth";
import { FormPayload } from "@/screens/Register/Register";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { normalizeAuthResponse } from "@/helpers/strapi";
import { getRegisterUrl } from "@/helpers/api/buildApiUrl";

export const useRegisterNewUser = (
	onSuccess: (data: AuthResponse) => void,
	onError: (error: AxiosError | Error) => void
) => {
	return useMutation<AuthResponse, AxiosError | Error, FormPayload>({
		mutationFn: async (formPayload: FormPayload) => {
			try {
				const registerPayload = {
					username: formPayload.username,
					email: formPayload.email,
					password: formPayload.password,
				};

				const response = await axios.post(getRegisterUrl(), registerPayload);
				return normalizeAuthResponse(response.data);
			} catch (error) {
				if (axios.isAxiosError(error)) {
					const responseData = error.response?.data as
						| {
								error?: {
									message?: string;
									details?: {
										errors?: { message?: string }[];
									};
								};
								message?: string | string[];
						  }
						| undefined;

					const directMessage =
						responseData?.error?.message ?? responseData?.message;
					const detailedMessage = responseData?.error?.details?.errors?.[0]?.message;

					const backendMessage = Array.isArray(directMessage)
						? directMessage.find(
								(message) =>
									typeof message === "string" && message.trim().length > 0
						  )
						: directMessage;

					error.message =
						(typeof backendMessage === "string" && backendMessage.trim()) ||
						(typeof detailedMessage === "string" && detailedMessage.trim()) ||
						error.message ||
						"Une erreur est survenue pendant l'inscription.";
					throw error;
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
