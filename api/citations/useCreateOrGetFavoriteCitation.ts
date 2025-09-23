import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

export interface CreateOrGetFavoriteCitationArgs {
	userId: number;
	citationId: number;
	token: string;
}

export interface FavoriteCitationRow {
	id: number; // row id
	userId?: number;
	citation?: { id: number };
}

export interface CreateOrGetFavoriteCitationResponse {
	data: FavoriteCitationRow;
}

export const useCreateOrGetFavoriteCitation = (
	onSuccess?: (data: CreateOrGetFavoriteCitationResponse) => void
) => {
	return useMutation<
		CreateOrGetFavoriteCitationResponse,
		AxiosError,
		CreateOrGetFavoriteCitationArgs
	>({
		mutationFn: async ({ userId, citationId, token }) => {
			const url = `${process.env.EXPO_PUBLIC_API_URL}/favorite-citations`;
			const payload = { data: { userId, citationId } };
			const res: AxiosResponse<CreateOrGetFavoriteCitationResponse> =
				await axios.post(url, payload, {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
			return res.data;
		},
		onSuccess,
	});
};
