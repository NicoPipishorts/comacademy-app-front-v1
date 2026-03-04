// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { SecretsResponse } from "@/types/secrets";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchData = async (token: string): Promise<SecretsResponse> => {
	try {
		const url = buildApiUrl("secrets?sort=Brand:asc&populate=*");
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
		console.error("Error fetching Amm Secrets:", error);
		throw error;
	}
};

const useGetAllSecrets = () => {
	const { token } = useJwtToken();

	return useQuery<SecretsResponse>({
		queryKey: ["SecretsFull"],
		queryFn: () => fetchData(token),
		enabled: !!token,
	});
};

export default useGetAllSecrets;
