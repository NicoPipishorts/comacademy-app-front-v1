import useJwtToken from "@/hooks/useJwtToken";
import { FavoriteQuestionsPayloadFull } from "@/types/favoriteQuestions";
import { useQuery } from "@tanstack/react-query";

const EMPTY_RESPONSE: FavoriteQuestionsPayloadFull = {
	data: [],
	meta: {},
};

const fetchFavoriteQuestions = async (
	token: string,
	userId: number
): Promise<FavoriteQuestionsPayloadFull> => {
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
				return EMPTY_RESPONSE;
			}

			console.error(
				`HTTP error! status: ${response.status}`,
				await response.text()
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data as FavoriteQuestionsPayloadFull;
	} catch (error) {
		console.error("Error fetching Fav Questions:", error);
		throw error;
	}
};

const useGetFavoriteQuestions = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<FavoriteQuestionsPayloadFull>({
		queryKey: ["FavoriteQuestions", userId],
		queryFn: () => fetchFavoriteQuestions(token!, userId),
		enabled: !!token && !!userId,
	});
};

export default useGetFavoriteQuestions;
