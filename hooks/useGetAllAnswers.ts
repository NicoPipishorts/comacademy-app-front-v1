import useJwtToken from "@/hooks/useJwtToken";
import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { SessionResultsAllquestions } from "./useGetEndOfSession";

export interface AnswerData {
	id: number;
	attributes: SessionResultsAllquestions;
}

export interface AnswerSessionGroup {
	gameId: number;
	completedAt?: string | null;
	answers: AnswerData[];
}

export interface AllAnswersResponse {
	data: AnswerSessionGroup[];
	allQuestions: number;
	allUserQuestions: number;
	meta: {
		pagination: {
			start: number;
			limit: number;
			total: number;
		};
	};
}

export interface FetchAllAnswersParams {
	userId?: number;
	limit?: number;
}

const EMPTY_RESPONSE: AllAnswersResponse = {
	data: [],
	allQuestions: 0,
	allUserQuestions: 0,
	meta: {
		pagination: {
			start: 0,
			limit: 10,
			total: 0,
		},
	},
};

const fetchPayload = async ({
	token,
	userId,
	start = 0,
	limit = 10,
}: {
	token: string;
	userId?: number;
	start?: number;
	limit?: number;
}): Promise<AllAnswersResponse> => {
	try {
		const baseUrl = userId
			? `${process.env.EXPO_PUBLIC_API_URL}/all-answers/${userId}`
			: `${process.env.EXPO_PUBLIC_API_URL}/all-answers`;
		const params = new URLSearchParams({
			start: String(start),
			limit: String(limit),
		});
		const response = await fetch(
			`${baseUrl}?${params.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

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

export const useGetUserAnswers = ({
	token,
	userId,
	limit = 10,
}: {
	token: string;
	userId?: number;
	limit?: number;
}) => {
	return useInfiniteQuery<
		AllAnswersResponse,
		Error,
		InfiniteData<AllAnswersResponse>,
		QueryKey,
		number
	>({
		queryKey: ["UserAnswers", userId, limit],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			fetchPayload({
				token: token!,
				userId,
				start: pageParam,
				limit,
			}),
		enabled: !!token && !!userId,
		getNextPageParam: (lastPage) => {
			const { start, limit: pageLimit, total } = lastPage.meta.pagination;
			return start + pageLimit < total ? start + pageLimit : undefined;
		},
	});
};

export const useGetAllAnswers = ({ limit = 10 }: { limit?: number } = {}) => {
	const { token } = useJwtToken();

	return useInfiniteQuery<
		AllAnswersResponse,
		Error,
		InfiniteData<AllAnswersResponse>,
		QueryKey,
		number
	>({
		queryKey: ["AllAnswers", limit],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			fetchPayload({
				token: token!,
				start: pageParam,
				limit,
			}),
		enabled: !!token,
		getNextPageParam: (lastPage) => {
			const { start, limit: pageLimit, total } = lastPage.meta.pagination;
			return start + pageLimit < total ? start + pageLimit : undefined;
		},
	});
};
