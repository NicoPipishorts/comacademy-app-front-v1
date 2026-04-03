import useJwtToken from "@/hooks/useJwtToken";
import { QuestionById } from "@/types/question";
import { useQuery } from "@tanstack/react-query";

type HttpError = Error & { status?: number };
type QuestionDocumentLookup = { data: { documentId?: string }[] };

const createHttpError = (message: string, status?: number) => {
	const error = new Error(message) as HttpError;
	error.status = status;
	return error;
};

const resolveQuestionDocumentId = async (
	token: string,
	questionDocumentId?: string,
	questionId?: number | null
): Promise<string> => {
	if (questionDocumentId) {
		return questionDocumentId;
	}

	if (!Number.isFinite(questionId as number) || (questionId as number) <= 0) {
		throw createHttpError("Missing question identifier");
	}

	const listUrl = `${process.env.EXPO_PUBLIC_API_URL}/questions?filters[id][$eq]=${questionId}`;
	const listResponse = await fetch(listUrl, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!listResponse.ok) {
		throw createHttpError(
			`Failed to resolve question documentId for id ${questionId}`,
			listResponse.status
		);
	}

	const listResult = (await listResponse.json()) as QuestionDocumentLookup;
	const resolvedDocumentId = listResult.data?.[0]?.documentId;
	if (!resolvedDocumentId) {
		throw createHttpError(`Question with id ${questionId} not found`, 404);
	}

	return resolvedDocumentId;
};

const fetchQuestionByIdentifier = async (
	token: string,
	questionDocumentId?: string,
	questionId?: number | null
): Promise<QuestionById> => {
	try {
		const resolvedDocumentId = await resolveQuestionDocumentId(
			token,
			questionDocumentId,
			questionId
		);
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/questions/${resolvedDocumentId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			const responseText = await response.text();
			console.error(
				`HTTP error! status: ${response.status}`,
				responseText
			);
			throw createHttpError(
				`HTTP error! status: ${response.status}`,
				response.status
			);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching Question by Id:", error);
		throw error;
	}
};

const useQuestionById = (
	questionDocumentId?: string,
	questionId?: number | null
) => {
	const { token } = useJwtToken();
	const hasDocumentId =
		typeof questionDocumentId === "string" && questionDocumentId.length > 0;
	const hasNumericId =
		Number.isFinite(questionId as number) && (questionId as number) > 0;

	return useQuery<QuestionById>({
		queryKey: ["Question", questionDocumentId ?? null, questionId ?? null],
		queryFn: () =>
			fetchQuestionByIdentifier(token, questionDocumentId, questionId),
		staleTime: 5000,
		enabled: !!token && (hasDocumentId || hasNumericId),
	});
};

export default useQuestionById;
