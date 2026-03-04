// src/hooks/useUpdateUserPreferences.ts

import { queryClient } from "@/hooks/reactQueryConfig";
import useJwtToken from "@/hooks/useJwtToken";
import {
	UserPreferenceData,
	UserPreferencesResponse,
} from "@/types/userPreferences";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export interface UpdateUserPreferencesPayload {
	avatarBackgroundColor?: string;
	avatarFileId?: number | null;
}

export const useUpdateUserPreferences = () => {
	const { token } = useJwtToken();

	return useMutation<
		UserPreferencesResponse,
		AxiosError,
		UpdateUserPreferencesPayload
	>({
		// 1) mutation function embedded in options
		mutationFn: async ({ avatarBackgroundColor, avatarFileId }) => {
			if (!token) {
				throw new Error("Missing authentication token");
			}

			const payloadData: UpdateUserPreferencesPayload = {};
			if (typeof avatarBackgroundColor === "string") {
				payloadData.avatarBackgroundColor = avatarBackgroundColor;
			}
			if (
				typeof avatarFileId === "number" ||
				avatarFileId === null
			) {
				payloadData.avatarFileId = avatarFileId;
			}
			if (Object.keys(payloadData).length === 0) {
				throw new Error("No user preferences field to update");
			}

			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-preferences/me`;

			const response = await axios.put(url, payloadData, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			const responseData = response.data as UserPreferencesResponse;
			if (
				responseData &&
				typeof responseData === "object" &&
				"data" in responseData
			) {
				return responseData;
			}

			return {
				data: response.data as UserPreferenceData,
				meta: {},
			};
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
