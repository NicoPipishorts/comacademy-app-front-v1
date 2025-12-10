// src/hooks/useGetFavoriteMetiers.ts
import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

// If you have a type, keep it; otherwise `any` is fine
export type FavoriteMetiersResponse = any;

// Utility: build a clean URL
const buildUrl = (
	base: string,
	qs: Record<string, string | number | boolean>
) => {
	const u = new URL(base);
	Object.entries(qs).forEach(([k, v]) => u.searchParams.set(k, String(v)));
	return u.toString();
};

const fetchFavoriteMetiers = async (
	token: string,
	userId: number
): Promise<FavoriteMetiersResponse> => {
	const base = `${process.env.EXPO_PUBLIC_API_URL}/favorite-metiers`;
	const url = buildUrl(base, {
		"filters[userId][$eq]": userId,
		"fields[0]": "id",
		publicationState: "live",
		"populate[metiers][fields][0]": "id",
		"populate[metiers][fields][1]": "METIER",
		"populate[metiers][fields][2]": "CATEGORIE",
	});

	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		if (res.status === 404) return { data: [] } as any; // normalize
		const text = await res.text();
		console.error(`Fav Metiers HTTP ${res.status}`, text);
		throw new Error(`HTTP ${res.status}`);
	}

	const json = await res.json();
	console.log("Fav Metiers Response:", JSON.stringify(json, null, 2));
	return json;
};

const useGetFavoriteMetiers = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<FavoriteMetiersResponse>({
		queryKey: ["FavoriteMetiers", userId],
		queryFn: () => fetchFavoriteMetiers(token!, userId),
		enabled: !!token && !!userId,
		refetchOnMount: "always",
		staleTime: 0,
	});
};

export default useGetFavoriteMetiers;
