import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

export interface FavoriteCitationItem {
	rowId: number;
	id: number; // citation id
}

export interface FavoriteCitationsResponse {
	data: {
		count: number;
		results: {
			data: FavoriteCitationItem[];
		};
	};
}

const fetchPayload = async (
	token: string,
	userId: number
): Promise<FavoriteCitationsResponse> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/favorite-citations/user/${userId}`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	if (!res.ok) {
		if (res.status === 404) return null as any;
		throw new Error(`HTTP error! status: ${res.status} ${await res.text()}`);
	}
	return res.json();
};

const useGetFavoriteCitations = (userId: number) => {
	const { token } = useJwtToken();
	return useQuery<FavoriteCitationsResponse>({
		queryKey: ["CitationsFavorites", userId],
		queryFn: () => fetchPayload(token!, userId),
		enabled: !!token && !!userId,
	});
};

export default useGetFavoriteCitations;
