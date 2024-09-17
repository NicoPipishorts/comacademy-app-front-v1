import { GameSessionQuestions } from "@/types/game"; // Assuming CategoryScore is defined
import { useQuery } from "@tanstack/react-query";

const fetchPayload = async (
	token: string,
	userId: number
): Promise<GameSessionQuestions> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-questions?sort[0]=createdAt:desc&populate=*&filters[userId][$eq]=${userId}&filters[answer][$eq]=true&pagination[limit]=10000`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		console.error(
			`HTTP error! Unable to get correctly answered questions: status: ${response.status}`,
			await response.text()
		);
		throw new Error(
			`HTTP error! Unable to get correctly answered questions: status: ${response.status}`
		);
	}

	const data: GameSessionQuestions = await response.json();
	return data;
};

export const useGetAnaswersTrue = (userId: number, token: string) => {
	return useQuery<GameSessionQuestions>({
		queryKey: ["AnswersTrue", userId],
		staleTime: 5000,
		queryFn: () => fetchPayload(token, userId),
		enabled: !!token && !!userId,
	});
};
