import useJwtToken from "@/hooks/useJwtToken";
import { GameSessionQuestions } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

const fetchCurrentQuestion = async (
	token: string,
	sessionId: number
): Promise<GameSessionQuestions> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-questions?filters[gameId][$eq]=${sessionId}`,
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

const useGameSessionsQuesions = (sessionId: number) => {
	const { token, loading } = useJwtToken();

	return useQuery<GameSessionQuestions>({
		queryKey: ["GameSessionQuestions", sessionId],
		queryFn: () => fetchCurrentQuestion(token!, sessionId),
		enabled: !loading && !!token && !!sessionId,
	});
};

export default useGameSessionsQuesions;
