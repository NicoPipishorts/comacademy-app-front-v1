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

// Custom hook to add favorite question
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

			const url = `${process.env.EXPO_PUBLIC_API_URL}/user-preferences/${userId}`;

			try {
				const response: AxiosResponse<SuccessPayload> = await axios({
					method: "PUT",
					url: url,
					data: payload,
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
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["UserPreferences"],
			});
		},
		onError: (error) => {
			if (error.response) {
				console.error("Error code:", error.response.status);
			}
		},
	});
};
