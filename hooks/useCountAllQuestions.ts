// src/hooks/useCategories.ts

import { useQuery } from "@tanstack/react-query";

interface QuestionsCount {
	count: number;
}

const fetchAllQuestions = async (token: string): Promise<QuestionsCount> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/questions?fields=id&pagination[limit]=10000`,
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
		console.error("Error fetching All Questions:", error);
		throw error;
	}
};

const useCountAllQuestions = (token: string) => {
	return useQuery<QuestionsCount>({
		queryKey: ["QuestionsCount"],
		queryFn: () => fetchAllQuestions(token),
		enabled: !!token,
	});
};

export default useCountAllQuestions;
