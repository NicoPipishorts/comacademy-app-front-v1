import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

export interface EndOfGameSessionPayload {
	data: {
		roundCommentaire: string | null;
		totalAnsweredQuestions: number;
	};
}

export interface SessionResultsPayload {
	data: {
		correctAnswers: number;
		percentageCorrect: number;
		totalPoints: number;
		allQuestions: SessionResultsAllquestions[];
	};
}

export interface SessionResultsAllquestions {
	id: number;
	question: string;
	questionId?: number;
	coef: number;
	questionAnswer: boolean;
	userAnswer: boolean;
}

// Generic fetch function to reduce code duplication
const fetchData = async <T>(
	url: string,
	token: string,
	fallback: T,
	fallbackStatuses: number[] = [404],
): Promise<T> => {
	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			if (fallbackStatuses.includes(response.status)) {
				return fallback;
			}
			const errorText = await response.text();
			console.error(`HTTP error! status: ${response.status}`, errorText);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data as T;
	} catch (error) {
		console.error("Error fetching data:", error);
		throw error;
	}
};

const EMPTY_END_OF_SESSION: EndOfGameSessionPayload = {
	data: {
		roundCommentaire: null,
		totalAnsweredQuestions: 0,
	},
};

const EMPTY_SESSION_RESULTS: SessionResultsPayload = {
	data: {
		correctAnswers: 0,
		percentageCorrect: 0,
		totalPoints: 0,
		allQuestions: [],
	},
};

// Fetch the end of session payload
const fetchEndOfSessionPayload = (token: string, userId: number) =>
	fetchData<EndOfGameSessionPayload>(
		`${process.env.EXPO_PUBLIC_API_URL}/end-of-game-session/${userId}`,
		token,
		EMPTY_END_OF_SESSION
	);

// Hook to get the end of session data
const useGetEndOfSession = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<EndOfGameSessionPayload>({
		queryKey: ["EndOfSessionsScore", userId],
		queryFn: () => fetchEndOfSessionPayload(token!, userId),
		enabled: !!token && !!userId,
	});
};

// Fetch the end of session results
const fetchEndOfSessionResults = (token: string, gameId: number) =>
	fetchData<SessionResultsPayload>(
		`${process.env.EXPO_PUBLIC_API_URL}/end-of-game-session/results/${gameId}`,
		token,
		EMPTY_SESSION_RESULTS,
		[404, 400],
	);

// Hook to get the session results
const useGetEndOfSessionResults = (gameId: number) => {
	const { token } = useJwtToken();

	return useQuery<SessionResultsPayload>({
		queryKey: ["EndOfSessionsScore", gameId],
		queryFn: () => fetchEndOfSessionResults(token!, gameId),
		enabled: !!token && !!gameId,
	});
};

export { useGetEndOfSession, useGetEndOfSessionResults };
