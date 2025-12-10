// src/hooks/useGetCommandementById.ts
import useJwtToken from "@/hooks/useJwtToken";
import { SingleCommandementResponse } from "@/types/commandements";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchData = async (
	token: string,
	itemId: string
): Promise<SingleCommandementResponse> => {
	const url = buildApiUrl(`commandements/${itemId}`);
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`HTTP ${res.status}`, text);
		throw new Error(`HTTP ${res.status}`);
	}

	const responseData = (await res.json()) as {
		data: {
			id: number;
			documentId: string;
			Theme: string;
			CardImage: string | null;
			staticId: number;
			KeyWord: string;
			cards: Array<{
				id: number;
				titre: string;
				contenus: string;
				cta: string | null;
				headerCard: boolean;
			}>;
		};
	};

	// Transform flat structure to nested structure with attributes
	const transformedData: SingleCommandementResponse = {
		data: {
			id: responseData.data.id,
			attributes: {
				Theme: responseData.data.Theme,
				Active: true, // Not provided by API, defaulting to true
				cards: responseData.data.cards.map((card) => ({
					id: card.id,
					titre: card.titre,
					contenus: card.contenus,
					cta: card.cta,
					headerCard: card.headerCard,
				})),
			},
		},
	};

	return transformedData;
};

const useGetCommandementById = (itemId: string) => {
	const { token } = useJwtToken();

	return useQuery<SingleCommandementResponse>({
		queryKey: ["CommandementsById", itemId],
		queryFn: () => fetchData(token, itemId),
		enabled: !!token && !!itemId,
	});
};

export default useGetCommandementById;
