// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { CitationsMenuResponse } from "@/types/citationsMenu";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchCitationsMenu = async (
	token: string
): Promise<CitationsMenuResponse> => {
	const url = buildApiUrl("citations-menu");
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const message = `HTTP error! status: ${response.status}`;
		const error = new Error(message);
		(error as any).status = response.status;
		try {
			(error as any).body = await response.text();
		} catch {
			// ignore
		}
		throw error;
	}

	const data = await response.json();
	return data;
};

const useGetCitationsMenu = () => {
	const { token } = useJwtToken();

	return useQuery<CitationsMenuResponse>({
		queryKey: ["CitationsMenu"],
		queryFn: () => fetchCitationsMenu(token),
		enabled: !!token,
	});
};

export default useGetCitationsMenu;
