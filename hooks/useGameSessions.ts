import useJwtToken from "@/hooks/useJwtToken";
import { GameSessionDetail } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

const fetchCurrentSessions = async (
	token: string,
	userId: number
): Promise<GameSessionDetail> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-sessions?filters[userId][$eq]=${userId}&filters[inProgress][$eq]=true`,
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

	const data: GameSessionDetail = await response.json();
	return data;
};

const useGameSessions = (userId: number) => {
	const { token, loading } = useJwtToken();

	return useQuery<GameSessionDetail>({
		queryKey: ["GameSession", { userId }],
		queryFn: () => fetchCurrentSessions(token!, userId),
		enabled: !loading && !!token && !!userId,
	});
};

export default useGameSessions;
