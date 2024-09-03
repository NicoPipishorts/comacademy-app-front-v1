import { useQuery } from "@tanstack/react-query";
import useJwtToken from "./useJwtToken";

interface GameScore {
	trueAnswersCount: number;
	totalAnswersCount: number;
	percentage: number;
}

interface Payload {
	id: number;
	attributes: {
		answer: boolean;
	};
}

const fetchGameScore = async (
	userId: number,
	gameId: number,
	token: string
): Promise<GameScore> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/game-questions?fields[0]=id&fields[1]=answer&filters[userId][$eq]=${userId}&filters[gameId][$eq]=${gameId}`,
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

		const totalAnswersCount = data.data.length;
		const trueAnswersCount = data.data.filter(
			(question: Payload) => question.attributes.answer === true
		).length;

		let percentage =
			totalAnswersCount > 0 ? (trueAnswersCount / totalAnswersCount) * 100 : 0;

		// Round the percentage to the nearest tenth
		percentage = parseFloat(percentage.toFixed(1));

		return { trueAnswersCount, totalAnswersCount, percentage };
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
