import { GameSessionQuestions } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

// Utility function to filter and remove duplicates
const processPayload = (data: GameSessionQuestions): GameSessionQuestions => {
	// Step 1: Filter for answers where answer === questionId.data.attributes.ANSWER
	const filteredData = data.data.filter((item) => {
		const answer = item.attributes.answer;
		const correctAnswer = item.attributes.questionId.data.attributes.ANSWER;
		return answer === correctAnswer;
	});

	// Step 2: Remove duplicates based on a unique field (e.g., `id`)
	const uniqueData = Array.from(
		new Set(filteredData.map((item) => item.id))
	).map((id) => filteredData.find((item) => item.id === id));

	// Return the filtered and de-duplicated data, wrapped in the GameSessionQuestions structure
	return {
		data: uniqueData, // Wrap the result back in the `data` field
		meta: data.meta, // Keep the original `meta` if present
	};
};
// Fetch function remains the same
const fetchPayload = async (
	token: string,
	userId: number
): Promise<GameSessionQuestions> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-questions?sort[0]=createdAt:desc&filters[userId][$eq]=${userId}&populate=*&pagination[limit]=10000`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		console.error(
			`HTTP error! Unable to get correctly answered questions: status: ${response.status}`,
			await response.text()
		);
		throw new Error(
			`HTTP error! Unable to get correctly answered questions: status: ${response.status}`
		);
	}

	const data: GameSessionQuestions = await response.json();

	// Process the payload (filter and remove duplicates)
	return processPayload(data);
};

// Your custom hook
export const useGetAnswersTrue = (userId: number, token: string) => {
	return useQuery<GameSessionQuestions>({
		queryKey: ["AnswersTrue", userId],
		staleTime: 5000,
		queryFn: () => fetchPayload(token, userId),
		enabled: !!token && !!userId,
	});
};
