// src/hooks/Commandements/useGetCommandements.ts

import useJwtToken from "@/hooks/useJwtToken";
import { MultipleCommandementsResponse } from "@/types/commandements";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchCommandements = async (
	token: string,
	categoryId: number | null
): Promise<MultipleCommandementsResponse> => {
	// choose endpoint based on categoryId
	const endpoint = categoryId
		? `commandements/by-category/${categoryId}`
		: "commandements";
	const url = buildApiUrl(endpoint);

	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`Error fetching commandements:`, res.status, text);
		throw new Error(`Failed to fetch commandements: ${res.status}`);
	}

	return res.json();
};

export const useGetCommandements = (categoryId: number | null = null) => {
	const { token } = useJwtToken();

	return useQuery<MultipleCommandementsResponse>({
		queryKey: ["Commandements", categoryId],
		queryFn: () => fetchCommandements(token, categoryId),
		enabled: !!token, // only run once we have a token
	});
};

export default useGetCommandements;
