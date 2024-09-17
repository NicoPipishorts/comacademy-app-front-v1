import useJwtToken from "@/hooks/useJwtToken";
import { FavoriteQuestionsPayloadFull } from "@/types/favoriteQuestions";
import { useQuery } from "@tanstack/react-query";

const getPayload = async (token: string, userId: number): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/favorite-questions/${userId}?populate=*`,
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
		console.error("Error fetching Fav Questions:", error);
		throw error;
	}
};

const useGetFavoriteQuestionsFull = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<FavoriteQuestionsPayloadFull>({
		queryKey: ["FavoriteQuestions", userId],
		queryFn: () => getPayload(token!, userId), // Ensure token is not null
		enabled: !!token && !!userId, // Ensure the query is enabled only when token and userId are available
	});
};

export default useGetFavoriteQuestionsFull;
