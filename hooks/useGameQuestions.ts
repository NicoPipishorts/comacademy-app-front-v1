// src/hooks/useGameQuestions.ts

import useJwtToken from "@/hooks/useJwtToken";
import { GameData, GameDataPayload } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

const fetchGameQuestions = async (token: string) => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/questions?populate[favorite-questions][fields]=id&random=true&pagination[limit]=30`,
			// `${process.env.EXPO_PUBLIC_API_URL}/questions?populate[favorite-questions][fields]=id&filters[id][$in]=20&filters[id][$in]=16&filters[id][$in]=17&filters[id][$in]=3&filters[id][$in]=2`,
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

		const transformedData = {
			...data,
			data: Object.keys(data.data).reduce((acc, key) => {
				const item = data.data[key];
				const categories = item.attributes.CATEGORIE.split(",").map(
					(cat: string) => {
						const parsed = parseInt(cat.trim(), 10);
						return !isNaN(parsed) ? parsed : 1;
					}
				);
				acc[key] = {
					...item,
					attributes: {
						...item.attributes,
						CATEGORIE: categories,
					},
				};
				return acc;
			}, {} as Record<string, GameData>),
		};

		return transformedData;
	} catch (error) {
		console.error("Error fetching game questions:", error);
		throw error;
	}
};

const useGameQuestions = () => {
	const { token } = useJwtToken();

	return useQuery<GameDataPayload>({
		queryKey: ["GameQuestions"],
		queryFn: () => fetchGameQuestions(token),
		enabled: !!token,
	});
};

export default useGameQuestions;
