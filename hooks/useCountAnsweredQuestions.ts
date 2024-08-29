// src/hooks/useCategories.ts

import { useQuery } from "@tanstack/react-query";

interface AnsweredQuestions {
	count: number;
}

const fetchAllQuestions = async (
	userId: number,
	token: string
): Promise<AnsweredQuestions> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/game-questions?fields=id&pagination[limit]=10000&filters[userId][$eq]=${userId}`,
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

		// Return the count of questions
		return { count: data.data.length };
	} catch (error) {
		console.error("Error fetching the answered questions:", error);
		throw error;
	}
};

const useCountAnsweredQuestions = (userId: number, token: string) => {
	return useQuery<AnsweredQuestions>({
		queryKey: ["AnsweredQuestions"],
		queryFn: () => fetchAllQuestions(userId, token),
		enabled: !!token && !!userId,
	});
};

export default useCountAnsweredQuestions;
