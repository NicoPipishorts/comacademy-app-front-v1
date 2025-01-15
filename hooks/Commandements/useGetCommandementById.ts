// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { CommandementPayload } from "@/types/commandements";
import { useQuery } from "@tanstack/react-query";

const fetchData = async (
	token: string,
	itemId: number
): Promise<CommandementPayload> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/commandements/${itemId}`,
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

const useGetCommandementById = (itemId: number) => {
	const { token } = useJwtToken();

	return useQuery<CommandementPayload>({
		queryKey: ["CommandementsById", itemId],
		queryFn: () => fetchData(token, itemId),
		enabled: !!token && !!itemId,
	});
};

export default useGetCommandementById;
