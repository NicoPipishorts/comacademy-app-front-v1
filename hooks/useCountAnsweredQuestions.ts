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
			`${process.env.EXPO_PUBLIC_API_URL}/game-questions?fields[0]=id&populate[questionId][fields][0]=id&filters[userId][$eq]=${userId}&filters[answer][$eq]=true`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`HTTP error! Unable to get all the answers for the count: status:${response.status}`,
				await response.text()
			);
			throw new Error(
				`HTTP error! Unable to get all the answers for the count: status: ${response.status}`
			);
		}

		const data = await response.json();

		const removeDuplicatesAndCount = (questions) => {
			const uniqueQuestions = new Map();

			questions.forEach((question) => {
				const questionId = question.attributes.questionId.data.id;
				if (!uniqueQuestions.has(questionId)) {
					uniqueQuestions.set(questionId, question);
				}
			});

			// Optional: Convert the Map back to an array if you need the filtered questions
			const uniqueQuestionsArray = Array.from(uniqueQuestions.values());

			// Return the count of unique questions
			return {
				count: uniqueQuestions.size,
				uniqueQuestionsArray, // Include this if you need the array of unique questions
			};
		};

		// Return the count of questions
		return removeDuplicatesAndCount(data.data);
	} catch (error) {
		console.error("Error fetching the answered questions:", error);
		throw error;
	}
};

const useCountAnsweredQuestions = (userId: number, token: string) => {
	return useQuery<AnsweredQuestions>({
		queryKey: ["AnsweredQuestions"],
		queryFn: () => fetchAllQuestions(userId, token),
		staleTime: 5000,
		enabled: !!token && !!userId,
	});
};

export default useCountAnsweredQuestions;
