import useJwtToken from "@/hooks/useJwtToken";
import { QuestionById } from "@/types/question";
import { useQuery } from "@tanstack/react-query";

const fetchDicoById = async (
	token: string,
	questionId: number
): Promise<QuestionById> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/questions/${questionId}`,
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
		return data;
	} catch (error) {
		console.error("Error fetching Question by Id:", error);
		throw error;
	}
};

const useQuestionById = (questionId: number) => {
	const { token } = useJwtToken();

	return useQuery<QuestionById>({
		queryKey: ["Question", questionId],
		queryFn: () => fetchDicoById(token, questionId),
		staleTime: 5000,
		enabled: !!token && !!questionId,
	});
};

export default useQuestionById;
