import { useQuery } from "@tanstack/react-query";

export type NiveauResponse = {
	data: {
		id: number;
		attributes: NiveauAttributes;
	}[];
};

export type NiveauAttributes = {
	statut: string;
	citation: string;
	commentaires: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
};

const fetchPayload = async (token: string): Promise<NiveauResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/niveaus?sort=id:ASC`,
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
		console.error("Error fetching Les Cistations:", error);
		throw error;
	}
};

const useGetNiveaux = (token: string) => {
	return useQuery<NiveauResponse>({
		queryKey: ["Niveaux c"],
		queryFn: () => fetchPayload(token),
		enabled: !!token,
		staleTime: 5000,
	});
};

export default useGetNiveaux;
