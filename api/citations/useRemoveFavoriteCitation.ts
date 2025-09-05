import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export interface RemoveFavoriteCitationArgs {
	userId: number;
	citationId: number;
	token: string;
}

export const useRemoveFavoriteCitation = (onSuccess?: () => void) => {
	return useMutation<void, AxiosError, RemoveFavoriteCitationArgs>({
		mutationFn: async ({ userId, citationId, token }) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-citations/user/${userId}/citation/${citationId}`;
			await axios.delete(url, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		},
		onSuccess,
	});
};
