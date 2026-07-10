import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

export interface ResponseDetailsPayload {
	data: {
		response: {
			id: number;
			documentId: string | null;
			gameId: number | string;
			userId: number | string;
			userAnswer: boolean;
			categorie: number | null;
			createdAt: string | null;
			updatedAt: string | null;
		};
		question: {
			id: number;
			documentId: string | null;
			title: string;
			correctAnswer: boolean;
			answerText: string;
			categories: number[];
			coef: number | null;
			tag: string | null;
			sensitivity: string | null;
		};
		categoryDetails: Array<{
			id: number;
			name: string | null;
			title: string | null;
			description: string | null;
			backgroundColor: string | null;
			staticId: number | null;
			smallIcon: string | null;
		}>;
		userState: {
			isFavorite: boolean;
			favoriteRecordId: number | null;
		};
	};
}

const fetchResponseDetails = async (
	token: string,
	answerDocumentId: string,
): Promise<ResponseDetailsPayload> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-questions/response-details/${answerDocumentId}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) {
		const error = new Error(`HTTP error! status: ${response.status}`) as Error & {
			status?: number;
		};
		error.status = response.status;
		throw error;
	}

	return (await response.json()) as ResponseDetailsPayload;
};

const useResponseDetailsByDocumentId = (answerDocumentId?: string) => {
	const { token } = useJwtToken();
	const hasDocumentId =
		typeof answerDocumentId === "string" && answerDocumentId.length > 0;

	return useQuery<ResponseDetailsPayload>({
		queryKey: ["ResponseDetails", answerDocumentId ?? null],
		queryFn: () => fetchResponseDetails(token!, answerDocumentId!),
		enabled: !!token && hasDocumentId,
	});
};

export default useResponseDetailsByDocumentId;
