import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

export interface FavoriteCitationItemFull {
	id: number;
	category: string;
	author: string;
	citation: string;
}

export interface FavoriteCitationsResponseFull {
	data: {
		count: number;
		results: {
			data: FavoriteCitationItemFull[];
		};
	};
}

const EMPTY_RESPONSE: FavoriteCitationsResponseFull = {
	data: {
		count: 0,
		results: {
			data: [],
		},
	},
};

const fetchPayload = async (
	token: string,
	userId: number
): Promise<FavoriteCitationsResponseFull> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/favorite-citations/user/${userId}/full`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	if (!res.ok) {
		if (res.status === 404) return EMPTY_RESPONSE;
		throw new Error(`HTTP error! status: ${res.status} ${await res.text()}`);
	}
	const data = await res.json();
	return data as FavoriteCitationsResponseFull;
};

const useGetFavoriteCitationsFull = (userId: number) => {
	const { token } = useJwtToken();
	return useQuery<FavoriteCitationsResponseFull>({
		queryKey: ["CitationsFavoritesFull", userId],
		queryFn: () => fetchPayload(token!, userId),
		enabled: !!token && !!userId,
	});
};

export default useGetFavoriteCitationsFull;
