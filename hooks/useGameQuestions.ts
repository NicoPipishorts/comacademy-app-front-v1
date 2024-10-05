// src/hooks/useGameQuestions.ts

import useJwtToken from "@/hooks/useJwtToken";
import { GameDataPayload } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

const fetchGameQuestions = async (token: string, userId: number) => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/questions?random=true&populate=*&pagination[limit]=30&filters[$or][0][game_session_questions][answer][$ne]=true&filters[$or][2][game_session_questions][userId][$nq]=${userId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`Error fetching game questions: status: ${response.status}`,
				await response.text()
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		const transformedData = {
			...data,
			data: Object.keys(data.data).reduce((acc, key) => {
				const item = data.data[key];

				// Split and parse the CATEGORIE string into an array of numbers
				let categories = item.attributes.CATEGORIE.split(",").map(
					(cat: string) => {
						const parsed = parseInt(cat.trim(), 10);
						return !isNaN(parsed) ? parsed : 1; // Defaults to 1 if parsing fails
					}
				);

				// If there is more than one category, pick one at random
				if (categories.length > 1) {
					const randomIndex = Math.floor(Math.random() * categories.length);
					categories = categories[randomIndex]; // Now this is a single number
				} else {
					// If it's just a single category, keep it as a number
					categories = categories[0] || 1; // Handle edge cases where the array might be empty
				}

				// Assign the (possibly reduced) categories number back to the transformed data
				acc[key] = {
					...item,
					attributes: {
						...item.attributes,
						CATEGORIE: categories, // Now CATEGORIE is a single number
					},
				};

				return acc;
			}, {}),
		};

		return transformedData;
	} catch (error) {
		console.error("Error fetching game questions: status:", error);
		throw error;
	}
};

const useGameQuestions = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<GameDataPayload>({
		queryKey: ["GameQuestions"],
		queryFn: () => fetchGameQuestions(token, userId),
		enabled: !!token && !!userId,
	});
};

export default useGameQuestions;
