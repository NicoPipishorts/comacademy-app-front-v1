// src/hooks/useCategories.ts

import { buildApiUrl } from "@/helpers/api/buildApiUrl";
import useJwtToken from "@/hooks/useJwtToken";
import { SecretResponse } from "@/types/secrets";
import { useQuery } from "@tanstack/react-query";

const fetchData = async (
	token: string,
	itemId: string
): Promise<SecretResponse> => {
	try {
		const url = buildApiUrl(`secrets/${itemId}`);
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

const useGetSecretById = (itemId: string) => {
	const { token } = useJwtToken();

	return useQuery<SecretResponse>({
		queryKey: ["SecretsById", itemId],
		queryFn: () => fetchData(token, itemId),
		enabled: !!token && !!itemId,
	});
};

export default useGetSecretById;
