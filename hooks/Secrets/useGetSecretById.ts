// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { SecretResponse } from "@/types/secrets";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchData = async (
	token: string,
	itemId: number
): Promise<SecretResponse> => {
	try {
		const url = buildApiUrl(
			`secrets/${itemId}?populate=cards`
		);
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

const useGetSecretById = (itemId: number) => {
	const { token } = useJwtToken();

	return useQuery<SecretResponse>({
		queryKey: ["SecretsById", itemId],
		queryFn: () => fetchData(token, itemId),
		enabled: !!token && !!itemId,
	});
};

export default useGetSecretById;
