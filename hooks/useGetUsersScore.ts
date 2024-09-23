import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

// TypeScript Definitions
export interface GameQuestionPayload {
	data: {
		id: number;
		attributes: {
			answer: boolean;
			userId: string;
		};
	}[];
}

export interface TransformedUserScore {
	userId: string;
	totalTrueValues: number;
	count: number;
}

export type TransformedUserScores = TransformedUserScore[];

// Fetch function
const fetchPayload = async (token: string): Promise<GameQuestionPayload> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-questions?filters[answer][$eq]=true&fields[1]=userId`,
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
		{ userId: string; totalTrueValues: number; count: number }
	> = {};

	response.data.forEach((item) => {
		const { userId, answer } = item.attributes;

		if (!result[userId]) {
			result[userId] = {
				userId,
				totalTrueValues: 0,
				count: 0,
			};
		}

		result[userId].count++;

		if (answer) {
			result[userId].totalTrueValues++;
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
