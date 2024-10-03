import { GameSessionQuestions } from "@/types/game"; // Assuming CategoryScore is defined
import { useQuery } from "@tanstack/react-query";
import { CategoryScore } from "./useGetScore";

export interface UserScoreByCategory {
	totalAnswersCount: number;
	categoryScores: Record<number, CategoryScore>;
	totalPoints: number;
}

const fetchPayload = async (
	token: string,
	userId: number
): Promise<GameSessionQuestions> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-questions?populate=*&filters[userId][$eq]=${userId}&pagination[limit]=10000`,
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

	const data: GameSessionQuestions = await response.json();
	return data;
};

export const useGetAllAnswer = (userId: number, token: string) => {
	return useQuery<GameSessionQuestions>({
		queryKey: ["AllAnswers", userId],
		queryFn: () => fetchPayload(token, userId),
		enabled: !!token && !!userId,
	});
};

export const useGetAllScores = (userId: number, token: string) => {
	return useQuery<UserScoreByCategory>({
		queryKey: ["GameSessionQuestions", userId],
		queryFn: async () => {
			const data = await fetchPayload(token!, userId);

			// Group the questions by category and calculate scores
			const categoryScores: Record<number, CategoryScore> = {};

			let totalPoints = 0; // Initialize total points

			data.data.forEach((question) => {
				const categoryId = question.attributes.categorie;
				const isTrueAnswer =
					question.attributes.answer ===
					question.attributes.questionId.data.attributes.ANSWER;
				const COEF =
					question.attributes.questionId?.data?.attributes?.COEF || 0; // Get the COEF value

				if (!categoryScores[categoryId]) {
					categoryScores[categoryId] = {
						trueAnswersCount: 0,
						totalAnswersCount: 0,
						percentage: 0,
					};
				}

				categoryScores[categoryId].totalAnswersCount += 1;

				if (isTrueAnswer) {
					categoryScores[categoryId].trueAnswersCount += 1;
					totalPoints += COEF; // Add COEF to totalPoints if the answer is true
				}
			});

			// Calculate the percentage for each category
			Object.keys(categoryScores).forEach((categoryId) => {
				const score = categoryScores[categoryId];
				score.percentage =
					score.totalAnswersCount > 0
						? parseFloat(
								(
									(score.trueAnswersCount / score.totalAnswersCount) *
									100
								).toFixed(1)
						  )
						: 0;
			});

			// Return the results with category scores and totalPoints
			const totalAnswersCount = data.data.length;
			return {
				totalAnswersCount,
				categoryScores,
				totalPoints, // Include totalPoints in the final result
			};
		},
		enabled: !!token && !!userId,
		staleTime: 5000,
	});
};
