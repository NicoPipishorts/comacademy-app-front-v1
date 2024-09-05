import { GameData } from "@/types/game";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

interface CreateNewGameSession {
	userId: number;
	token: string;
	questionsPool: GameData[];
}
interface UpdateSessionProps {
	sessionId: number;
	token: string;
	questionsPool: GameData[];
}

interface NewSessionResponse {
	data: any; // Adjust based on your response structure
}

// Custom hook to add favorite question
export const StartNewGameSession = (
	onSuccess: (data: any) => void, // TODO: Replace `any` with the correct type if possible
	onError: (error: AxiosError) => void
) => {
	return useMutation<NewSessionResponse, AxiosError, CreateNewGameSession>({
		mutationFn: async ({
			userId,
			token,
			questionsPool,
		}: CreateNewGameSession) => {
			// Log the questionsPool prop to see what data it contains

			const payload = {
				data: {
					userId,
					questionsPool,
				},
			};

			const url = `${process.env.EXPO_PUBLIC_API_URL}/game-sessions`;

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
					console.error("Axios error:", error); // Log Axios errors
					throw error;
				} else {
					console.error("Unexpected error:", error); // Log unexpected errors
					throw new Error("An unexpected error occurred");
				}
			}
		},
		onSuccess: (data) => {
			onSuccess(data); // Call the original onSuccess callback
		},
		onError: (error) => {
			if (error.response) {
				console.error("Error code:", error.response.status); // Log the error status code
			}
			onError(error); // Call the original onError callback
		},
	});
};

export const UpdateSession = (
	onSuccess: (data: any) => void, // TODO: Replace `any` with the correct type if possible
	onError: (error: AxiosError) => void
) => {
	return useMutation<NewSessionResponse, AxiosError, UpdateSessionProps>({
		mutationFn: async ({
			sessionId,
			token,
			questionsPool,
		}: UpdateSessionProps) => {
			// Log the questionsPool prop to see what data it contains

			const payload = {
				data: {
					questionsPool,
				},
			};

			const url = `${process.env.EXPO_PUBLIC_API_URL}/game-sessions/${sessionId}`;

			try {
				const response: AxiosResponse<NewSessionResponse> = await axios({
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
					console.error("Axios error:", error); // Log Axios errors
					throw error;
				} else {
					console.error("Unexpected error:", error); // Log unexpected errors
					throw new Error("An unexpected error occurred");
				}
			}
		},
		onSuccess: (data) => {
			onSuccess(data); // Call the original onSuccess callback
		},
		onError: (error) => {
			if (error.response) {
				console.error("Error code:", error.response.status); // Log the error status code
			}
			onError(error); // Call the original onError callback
		},
	});
};
