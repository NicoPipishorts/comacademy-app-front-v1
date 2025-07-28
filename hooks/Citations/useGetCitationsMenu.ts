// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { CitationsMenuResponse } from "@/types/citationsMenu";
import { useQuery } from "@tanstack/react-query";

const fetchCitationsMenu = async (
	token: string
): Promise<CitationsMenuResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/citations-menu`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

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
