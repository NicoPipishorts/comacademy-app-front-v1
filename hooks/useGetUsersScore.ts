import { useQuery } from "@tanstack/react-query";

// TypeScript definitions

export interface ScoreByCategory {
	totalScore: number;
	percentageCorrect: number;
}

export interface UserAttributes {
	userId: string;
	firstName: string;
	lastName: string;
}

export interface UserScoreAttributes {
	user: UserAttributes;
	totalScore: number;
	totalAnsweredQuestions: number;
	totalPercentageCorrect: number;
	scoreByCategories: {
		[category: number]: ScoreByCategory; // Categories are likely numbers 1-6, so using 'number' as key
	};
}

export interface UserScoreData {
	id: string;
	attributes: UserScoreAttributes;
}

export interface SingleUserScoreResponse {
	data: UserScoreData[];
}

export interface AllUsersScoreResponse {
	data: UserScoreData[];
}

// Fetch function for all users' scores
async function fetchAllUsersScores(
	token: string
): Promise<AllUsersScoreResponse> {
	const url = `${process.env.EXPO_PUBLIC_API_URL}/total-scores`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		console.error(
			`Error fetching all the Users Scores, status: ${response.status}`,
			await response.text()
		);
		throw new Error(
			`Error fetching all the Users Scores, status: ${response.status}`
		);
	}

	const data: AllUsersScoreResponse = await response.json();
	return data;
}

// Fetch function for a single user's score
async function fetchSingleUserScore(
	token: string,
	userId: number
): Promise<SingleUserScoreResponse> {
	const url = `${process.env.EXPO_PUBLIC_API_URL}/total-scores/${userId}`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		console.error(
			`Error fetching the User Score for userId ${userId}, status: ${response.status}`,
			await response.text()
		);
		throw new Error(
			`Error fetching the User Score for userId ${userId}, status: ${response.status}`
		);
	}

	const data: SingleUserScoreResponse = await response.json();
	return data;
}

// Hook to get all users' scores
export const useGetUsersScore = (token: string) => {
	return useQuery<AllUsersScoreResponse, Error>({
		queryKey: ["Scores"],
		queryFn: () => fetchAllUsersScores(token),
		enabled: !!token,
		staleTime: 1000,
	});
};

// Hook to get a specific user's score
export const useGetUserScore = (token: string, userId: number) => {
	return useQuery<SingleUserScoreResponse, Error>({
		queryKey: ["Scores", userId],
		queryFn: () => fetchSingleUserScore(token, userId),
		enabled: !!token && !!userId,
		staleTime: 1000,
	});
};
