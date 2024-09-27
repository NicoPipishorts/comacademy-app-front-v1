import { useQuery } from "@tanstack/react-query";
import useJwtToken from "./useJwtToken";

export interface CategoryScore {
	trueAnswersCount: number;
	totalAnswersCount: number;
	percentage: number;
}

export interface GameScore {
	trueAnswersCount: number;
	totalAnswersCount: number;
	percentage: number;
	categoryScores: Record<number, CategoryScore>;
	totalScore: number; // Add totalScore key to the final object
}

interface Payload {
	id: number;
	attributes: {
		answer: boolean;
		categorie: number;
		questionId: {
			data: {
				attributes: {
					COEF: number; // Get the COEF value from questionId relation
				};
			};
		};
	};
}

const fetchGameScore = async (
	userId: number,
	gameId: number,
	token: string
): Promise<GameScore> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/game-questions?fields[0]=id&fields[1]=answer&fields[2]=categorie&filters[userId][$eq]=${userId}&filters[gameId][$eq]=${gameId}&populate[questionId][fields][0]=COEF`,
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

		// Initialize category scores with 0 for all 6 categories
		const categoryScores: Record<number, CategoryScore> = {
			1: { trueAnswersCount: 0, totalAnswersCount: 0, percentage: 0 },
			2: { trueAnswersCount: 0, totalAnswersCount: 0, percentage: 0 },
			3: { trueAnswersCount: 0, totalAnswersCount: 0, percentage: 0 },
			4: { trueAnswersCount: 0, totalAnswersCount: 0, percentage: 0 },
			5: { trueAnswersCount: 0, totalAnswersCount: 0, percentage: 0 },
			6: { trueAnswersCount: 0, totalAnswersCount: 0, percentage: 0 },
		};

		let totalScore = 0; // Initialize total score based on COEF

		// Aggregate the data by categories
		data.data.forEach((question: Payload) => {
			const category = question.attributes.categorie;
			const isTrueAnswer = question.attributes.answer === true;
			const COEF = question.attributes.questionId?.data?.attributes?.COEF || 0; // Get COEF value from questionId

			categoryScores[category].totalAnswersCount++;
			if (isTrueAnswer) {
				categoryScores[category].trueAnswersCount++;
				totalScore += COEF; // Add COEF to total score if answer is true
			}
		});

		// Calculate percentages for each category
		for (const category in categoryScores) {
			const score = categoryScores[category];
			if (score.totalAnswersCount > 0) {
				score.percentage = parseFloat(
					((score.trueAnswersCount / score.totalAnswersCount) * 100).toFixed(1)
				);
			} else {
				score.percentage = 0;
			}
		}

		// Calculate overall score
		const totalAnswersCount = data.data.length;
		const trueAnswersCount = data.data.filter(
			(question: Payload) => question.attributes.answer === true
		).length;

		let percentage =
			totalAnswersCount > 0 ? (trueAnswersCount / totalAnswersCount) * 100 : 0;

		// Round the overall percentage to the nearest tenth
		percentage = parseFloat(percentage.toFixed(1));

		return {
			trueAnswersCount,
			totalAnswersCount,
			percentage,
			categoryScores,
			totalScore,
		};
	} catch (error) {
		console.error("Error fetching the game score:", error);
		throw error;
	}
};

const useGetGameScore = ({
	userId,
	gameId,
}: {
	userId: number;
	gameId: number;
}) => {
	const { token } = useJwtToken();

	return useQuery<GameScore>({
		queryKey: ["GameScore", userId, gameId],
		queryFn: () => fetchGameScore(userId, gameId, token),
		enabled: !!token && !!userId && !!gameId,
	});
};

export default useGetGameScore;
