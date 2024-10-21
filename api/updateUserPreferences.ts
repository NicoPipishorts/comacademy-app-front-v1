import { queryClient } from "@/hooks/reactQueryConfig";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

// Define the payload and response types
interface FinishSessionPayload {
	userId: number;
	avatarBackgroundColor: string;
	token: string;
}

interface SuccessPayload {
	data: any;
}

// Custom hook to update user preferences
export const UpdateUserPreferences = () => {
	return useMutation<SuccessPayload, AxiosError, FinishSessionPayload>({
		mutationFn: async ({
			userId,
			avatarBackgroundColor,
			token,
		}: FinishSessionPayload) => {
			const payload = {
				data: {
					avatarBackgroundColor,
				},
			};

			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-preferences?filters[user_id]=${userId}`;
			const postUrl = `${process.env.EXPO_PUBLIC_API_URL}/user-preferences`;

			try {
				// First, check if the preferences for the user exist by making a GET request
				const getResponse = await axios.get(url, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				// Check if there are existing preferences for the user
				if (getResponse.data.data.length > 0) {
					// Extract the ID of the existing preference (assuming it's in getResponse.data.data[0].id)
					const existingPreferenceId = getResponse.data.data[0].id;
					const putUrl = `${process.env.EXPO_PUBLIC_API_URL}/user-preferences/${existingPreferenceId}`;

					const putResponse: AxiosResponse<SuccessPayload> = await axios({
						method: "PUT",
						url: putUrl,
						data: payload,
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					});
					return putResponse.data;
				} else {
					const postResponse: AxiosResponse<SuccessPayload> = await axios({
						method: "POST",
						url: postUrl,
						data: { data: { user_id: userId, avatarBackgroundColor } },
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					});
					return postResponse.data;
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					throw error;
				} else {
					throw new Error("An unexpected error occurred");
				}
			}
		},
		onSuccess: () => {
			queryClient.refetchQueries({
				queryKey: ["UserPreferences"],
			});
		},
		onError: (error) => {
			if (error.response) {
				console.error("On Error: Error code:", error.response.status);
				console.error("Response data:", error.response.data);
			} else {
				console.error("An unexpected error occurred:", error.message);
			}
		},
	});
};
