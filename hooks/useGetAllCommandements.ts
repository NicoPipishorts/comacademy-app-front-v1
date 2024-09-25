// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { CommandementsPayload } from "@/types/commandements";
import { useQuery } from "@tanstack/react-query";

const fetchData = async (token: string): Promise<CommandementsPayload> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/commandements?sort=id:asc&populate=*`,
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
		console.error("Error fetching Amm Secrets:", error);
		throw error;
	}
};

const useGetAllCommandements = () => {
	const { token } = useJwtToken();

	return useQuery<CommandementsPayload>({
		queryKey: ["CommandementsFull"],
		queryFn: () => fetchData(token),
		enabled: !!token,
	});
};

export default useGetAllCommandements;
