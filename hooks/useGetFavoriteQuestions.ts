import useJwtToken from "@/hooks/useJwtToken";
import { FavoriteQuestionsPayload } from "@/types/favoriteQuestions";
import { useQuery } from "@tanstack/react-query";

const fetchFavoriteQuestions = async (
	token: string,
	userId: number
): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/favorite-questions/${userId}?populate[questions][fields]=id`,
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

const useGetFavoriteQuestions = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<FavoriteQuestionsPayload>({
		queryKey: ["FavoriteQuestions", userId],
		queryFn: () => fetchFavoriteQuestions(token!, userId), // Ensure token is not null
		enabled: !!token && !!userId, // Ensure the query is enabled only when token and userId are available
	});
};

export default useGetFavoriteQuestions;
