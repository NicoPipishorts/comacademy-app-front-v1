import useJwtToken from "@/hooks/useJwtToken";
import { FavoriteQuestionsPayloadFull } from "@/types/favoriteQuestions";
import { useQuery } from "@tanstack/react-query";

const fetchFavoriteQuestions = async (
	token: string,
	userId: number
): Promise<FavoriteQuestionsPayloadFull | null> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/favorite-questions?filters[userId][$eq]=${userId}&populate=*`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			// Check if it's a 404 error and handle it gracefully
			if (response.status === 404) {
				return null;
			}

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

	return useQuery<FavoriteQuestionsPayloadFull | null>({
		queryKey: ["FavoriteQuestions", userId],
		queryFn: () => fetchFavoriteQuestions(token!, userId),
		enabled: !!token && !!userId,
	});
};

export default useGetFavoriteQuestions;
