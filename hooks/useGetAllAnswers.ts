import useJwtToken from "@/hooks/useJwtToken";
import { GameSessionQuestions } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

const fetchPayload = async (
	token: string,
	userId: number
): Promise<GameSessionQuestions> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/game-questions?filters[userId][$eq]=${userId}`,
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

const useGetAllAnswers = (userId: number) => {
	const { token, loading } = useJwtToken();

	return useQuery<GameSessionQuestions>({
		queryKey: ["GameSessionQuestions", userId],
		queryFn: () => fetchPayload(token!, userId),
		enabled: !loading && !!token && !!userId,
	});
};

export default useGetAllAnswers;
