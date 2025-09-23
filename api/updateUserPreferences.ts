// src/hooks/useUpdateUserPreferences.ts

import { queryClient } from "@/hooks/reactQueryConfig";
import useJwtToken from "@/hooks/useJwtToken";
import { UserPreferencesResponse } from "@/types/userPreferences";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export interface UpdateUserPreferencesPayload {
	userId: number;
	avatarBackgroundColor: string;
}

export const useUpdateUserPreferences = () => {
	const { token } = useJwtToken();

	return useMutation<
		UserPreferencesResponse,
		AxiosError,
		UpdateUserPreferencesPayload
	>({
		// 1) mutation function embedded in options
		mutationFn: async ({ userId, avatarBackgroundColor }) => {
			if (!token) {
				throw new Error("Missing authentication token");
			}

			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-preferences/${userId}`;
			const payload = { data: { avatarBackgroundColor } };

			const response = await axios.put<UserPreferencesResponse>(url, payload, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			return response.data;
		},

		// 2) onSuccess handler
		onSuccess: (_data) => {
			queryClient.invalidateQueries({
				queryKey: ["UserPreferences"],
			});
		},

		// 3) onError handler
		onError: (error) => {
			if (error.response) {
				console.error(
					"UpdateUserPreferences error:",
					error.response.status,
					error.response.data
				);
			} else {
				console.error("Unexpected error:", error.message);
			}
		},
	} as UseMutationOptions<UserPreferencesResponse, AxiosError, UpdateUserPreferencesPayload>);
};

export default useUpdateUserPreferences;
