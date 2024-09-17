// src/hooks/useGameQuestions.ts

import useJwtToken from "@/hooks/useJwtToken";
import { QuestionById } from "@/types/question";
import { useQuery } from "@tanstack/react-query";

const fetchDicoById = async (
	token: string,
	id: number
): Promise<QuestionById> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/questions/${id}`,
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

const useQuestionById = (id: number) => {
	const { token } = useJwtToken();

	return useQuery<QuestionById>({
		queryKey: ["Question", id],
		queryFn: () => fetchDicoById(token, id),
		staleTime: 5000,
		enabled: !!token && !!id,
	});
};

export default useQuestionById;
