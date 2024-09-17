// src/hooks/useGameQuestions.ts

import useJwtToken from "@/hooks/useJwtToken";
import { GameData, GameDataPayload } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

function generateQueryString() {
	const totalNumbers = 30;
	const maxNumber = 3400;
	let numbers = new Set();

	// Generate 30 unique random numbers
	while (numbers.size < totalNumbers) {
		const randomNum = Math.floor(Math.random() * (maxNumber + 1)); // +1 because the upper limit is inclusive
		numbers.add(randomNum);
	}

	// Convert the Set to an Array and then map to the desired string format
	const queryString = Array.from(numbers)
		.map((num, index) => `filters[id][$in][${index}]=${num}`)
		.join("&");

	return queryString;
}

// Example usage:
const queryString = generateQueryString();

const fetchGameQuestions = async (token: string, userId: number) => {
	try {
		const response = await fetch(
			// `${process.env.EXPO_PUBLIC_API_URL}/questions?${queryString}&populate[favorite-questions][fields]=id`,

			`${process.env.EXPO_PUBLIC_API_URL}questions?populate=*&pagination[limit]=30&filters[$or][0][game_session_questions][answer][$ne]=true&filters[$or][1][game_session_questions][id][$null]=true&filters[$or][2][game_session_questions][userId][$eq]=${userId}&filters[$or][3][game_session_questions][userId][$null]=true`,
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

				// Split and parse the CATEGORIE string into an array of numbers
				let categories = item.attributes.CATEGORIE.split(",").map(
					(cat: string) => {
						const parsed = parseInt(cat.trim(), 10);
						return !isNaN(parsed) ? parsed : 1;
					}
				);

				// If there is more than one category, pick one at random
				if (categories.length > 1) {
					const randomIndex = Math.floor(Math.random() * categories.length);
					categories = [categories[randomIndex]]; // Only keep the randomly chosen category
				}

				// Assign the (possibly reduced) categories array back to the transformed data
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

const useGameQuestions = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<GameDataPayload>({
		queryKey: ["GameQuestions"],
		queryFn: () => fetchGameQuestions(token, userId),
		enabled: !!token && !!userId,
	});
};

export default useGameQuestions;
