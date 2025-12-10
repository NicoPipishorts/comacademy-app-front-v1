import { buildApiUrl } from "@/helpers/api/buildApiUrl";
import { CitationsResponse } from "@/types/lesCitations";
import { useQuery } from "@tanstack/react-query";
import useJwtToken from "../useJwtToken";

const fetchCitations = async (
	token: string,
	category: string
): Promise<CitationsResponse> => {
	try {
		const url = buildApiUrl(
			`citations/by-category/${encodeURIComponent(category)}`
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

		const responseData = (await response.json()) as {
			data: {
				cat: string;
				results: {
					id: number;
					AUTEUR: string;
					CATEGORIE: string;
					CITATION: string;
					VISIBLE: boolean;
					createdAt: string;
					updatedAt: string;
					publishedAt: string;
					documentId: string;
				}[];
			};
		};

		// Transform flat structure to nested structure with attributes
		const transformedData: CitationsResponse = {
			data: {
				cat: responseData.data.cat,
				results: Array.isArray(responseData.data.results)
					? responseData.data.results.map((item) => ({
							id: item.id,
							attributes: {
								AUTEUR: item.AUTEUR,
								CATEGORIE: item.CATEGORIE,
								CITATION: item.CITATION,
								createdAt: item.createdAt,
								updatedAt: item.updatedAt,
							},
					  }))
					: [],
			},
		};

		return transformedData;
	} catch (error) {
		console.error("Error fetching Les Cistations:", error);
		throw error;
	}
};

const useLesCitations = (category: string) => {
	const { token } = useJwtToken();
	return useQuery<CitationsResponse>({
		queryKey: ["Citations", { category }],
		queryFn: () => fetchCitations(token, category),
		enabled: !!token,
		staleTime: 1000,
		refetchOnWindowFocus: true,
		refetchOnMount: true,
		gcTime: 1000,
	});
};

export default useLesCitations;
