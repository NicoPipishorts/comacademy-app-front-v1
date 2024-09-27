import useJwtToken from "@/hooks/useJwtToken";
import { GameSessionQuestions } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

const fetchDicoById = async (
	token: string,
	userId: number,
	gameId: number
): Promise<GameSessionQuestions> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/game-questions?filters[userId][$eq]=${userId}&filters[gameId]($eq]=${gameId}&populate=*`,
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
		console.error("Error end of session game questions:", error);
		throw error;
	}
};

const useGetFinishedSessionAnswers = (userId: number, gameId: number) => {
	const { token } = useJwtToken();

	return useQuery<GameSessionQuestions>({
		queryKey: ["Question", userId],
		queryFn: () => fetchDicoById(token, userId, gameId),
		staleTime: 5000,
		enabled: !!token && !!userId && !!gameId,
	});
};

export default useGetFinishedSessionAnswers;
