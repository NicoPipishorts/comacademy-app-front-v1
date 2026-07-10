import { buildApiUrl } from "@/helpers/api/buildApiUrl";
import { QK } from "@/helpers/api/queryKeys";
import { GameQuestionsResponse } from "@/types/userGameSessionStatus";
import { useQuery } from "@tanstack/react-query";

type ParcoursGameSessionResponse = {
	data: GameQuestionsResponse;
};

const authHeader = (token?: string | null) =>
	token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {};

const fetchParcoursGameSession = async ({
	userId,
	categoryId,
	questionCount,
	sessionId,
	token,
}: {
	userId: number;
	categoryId: number;
	questionCount: number;
	sessionId?: number | null;
	token: string | null;
}) => {
	const params = new URLSearchParams();
	params.set("limit", String(questionCount));

	if (sessionId && Number.isFinite(sessionId) && sessionId > 0) {
		params.set("sessionId", String(sessionId));
	} else {
		params.set("dedicated", "1");
	}

	const response = await fetch(
		buildApiUrl(
			`/user-game-session-status/${userId}/category/${categoryId}?${params.toString()}`
		),
		{
			headers: {
				Accept: "application/json",
				...authHeader(token),
			},
		}
	);

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`HTTP ${response.status}: ${text || "Request failed"}`);
	}

	return (await response.json()) as ParcoursGameSessionResponse;
};

export const useParcoursGameSession = ({
	userId,
	categoryId,
	questionCount,
	sessionId,
	token,
	loadingToken,
}: {
	userId: number | null | undefined;
	categoryId: number | null | undefined;
	questionCount: number;
	sessionId?: number | null;
	token: string | null;
	loadingToken: boolean;
}) =>
	useQuery<ParcoursGameSessionResponse>({
		queryKey: QK.parcoursGameQuestions(
			userId ?? 0,
			categoryId ?? 0,
			questionCount,
			sessionId
		),
		enabled:
			Boolean(userId) &&
			Boolean(categoryId) &&
			Boolean(token) &&
			!loadingToken &&
			questionCount > 0,
		queryFn: () =>
			fetchParcoursGameSession({
				userId: userId!,
				categoryId: categoryId!,
				questionCount,
				sessionId,
				token,
			}),
		placeholderData: (previousData) => previousData,
		refetchOnWindowFocus: false,
	});
