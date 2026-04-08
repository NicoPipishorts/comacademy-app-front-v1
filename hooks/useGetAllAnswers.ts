import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";
import { SessionResultsAllquestions } from "./useGetEndOfSession";
export interface AllAnswersResponse {
	data: AnswerData[];
	allQuestions: number;
	allUserQuestions: number;
}

export interface AnswerData {
	id: number;
	attributes: SessionResultsAllquestions;
}

export interface AnswerAttributes {
	userAnswer: boolean;
	questionAnswer: boolean;
	questionId: number;
	questionDocumentId?: string | null;
	question: string;
}

export interface FetchAllAnswersParams {
	userId?: number;
}

const EMPTY_RESPONSE: AllAnswersResponse = {
	data: [],
	allQuestions: 0,
	allUserQuestions: 0,
};

const fetchPayload = async (
	token: string,
	userId?: number
): Promise<AllAnswersResponse> => {
	try {
		const url = userId
			? `${process.env.EXPO_PUBLIC_API_URL}/all-answers?userId=${userId}`
			: `${process.env.EXPO_PUBLIC_API_URL}/all-answers`;

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
				return EMPTY_RESPONSE;
			}

			console.error(
				`HTTP error! status: ${response.status}`,
				await response.text()
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching answers:", error);
		throw error;
	}
};

export const useGetUserAnswers = (token: string, userId: number) => {
	return useQuery<AllAnswersResponse>({
		queryKey: ["UserAnswers", userId],
		queryFn: () => fetchPayload(token!, userId),
		enabled: !!token && !!userId,
	});
};

export const useGetAllAnswers = () => {
	const { token } = useJwtToken();

	return useQuery<AllAnswersResponse>({
		queryKey: ["AllAnswers"],
		queryFn: () => fetchPayload(token!),
		enabled: !!token,
	});
};
