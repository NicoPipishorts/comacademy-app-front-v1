import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

// TypeScript Definitions
export interface GameQuestionPayload {
	data: {
		id: number;
		attributes: {
			answer: boolean;
			userId: string;
			questionId: {
				data: {
					id: number;
					attributes: {
						COEF: number;
						ANSWER: boolean;
					};
				};
			};
		};
	}[];
}

export interface TransformedUserScore {
	userId: string;
	totalCOEF: number;
	count: number;
}

export type TransformedUserScores = TransformedUserScore[];

// Fetch function
const fetchPayload = async (token: string): Promise<GameQuestionPayload> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-questions?fields[0]=answer&fields[1]=userId&populate[questionId][fields][0]=COEF&populate[questionId][fields][1]=ANSWER`,
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
	return data; // Return the untransformed payload
};

// Transform function
const transformResponse = (
	response: GameQuestionPayload
): TransformedUserScores => {
	const result: Record<
		string,
		{ userId: string; totalCOEF: number; count: number }
	> = {};

	response.data.forEach((item) => {
		const { userId, answer } = item.attributes;
		const questionAttributes = item.attributes.questionId?.data?.attributes;
		const COEF = questionAttributes?.COEF ?? 0;
		const correctAnswer = questionAttributes?.ANSWER;

		// Initialize the object for the user if it doesn't exist yet
		if (!result[userId]) {
			result[userId] = {
				userId,
				totalCOEF: 0,
				count: 0,
			};
		}

		// Add COEF only if the answer matches the correct answer
		if (answer === correctAnswer) {
			// Increment the count and sum the COEF values
			result[userId].count++;
			result[userId].totalCOEF += COEF;
		}
	});

	// Convert the object to an array and sort it by count in descending order
	return Object.values(result).sort((a, b) => b.count - a.count);
};

// Hook with query
const useGetUsersScore = () => {
	const { token } = useJwtToken();

	return useQuery<GameQuestionPayload, Error, TransformedUserScores>({
		queryKey: ["UsersScore"],
		queryFn: () => fetchPayload(token!), // fetches GameQuestionPayload
		enabled: !!token,
		select: (data) => transformResponse(data), // Transforms to TransformedUserScores
	});
};

export default useGetUsersScore;
