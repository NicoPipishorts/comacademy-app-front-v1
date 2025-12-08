// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { CitationsMenuResponse } from "@/types/citationsMenu";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchCitationsMenu = async (
	token: string
): Promise<CitationsMenuResponse> => {
	try {
		const url = buildApiUrl("citations-menu");
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			console.error(
				`HTTP error! status: ${response.status}`,
				await response.text()
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching  Citations Menu:", error);
		throw error;
	}
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
