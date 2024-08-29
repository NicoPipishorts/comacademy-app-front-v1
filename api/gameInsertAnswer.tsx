import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export interface CreateNewGameSession {
	gameId: number;
	userId: number;
	questionId: number;
	answer: boolean;
	token: string;
}

interface NewSessionResponse {
	data: any; // Adjust based on your response structure
}

// Custom hook to add favorite question
export const insertAnswer = () =>
	// onSuccess: (data: any) => void, //TODO
	// onError: (error: AxiosError) => void
	{
		return useMutation<NewSessionResponse, AxiosError, CreateNewGameSession>({
			mutationFn: async ({
				gameId,
				userId,
				questionId,
				answer,
				token,
			}: CreateNewGameSession) => {
				const payload = {
					data: {
						gameId,
						userId,
						questionId,
						answer,
					},
				};

				const url = `${process.env.EXPO_PUBLIC_API_URL}/game-questions`;

				try {
					const response: AxiosResponse<NewSessionResponse> = await axios({
						method: "POST",
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
			// onSuccess: (data) => {
			// 	onSuccess(data); // Call the original onSuccess callback
			// },
			// onError: (error) => {
			// 	if (error.response) {
			// 		console.error("Error code:", error.response.status);
			// 	}
			// 	onError(error); // Call the original onError callback
			// },
		});
	};
