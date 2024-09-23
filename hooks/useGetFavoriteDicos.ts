import useJwtToken from "@/hooks/useJwtToken";
import { DicoFavoritesResponse } from "@/types/dico";
import { useQuery } from "@tanstack/react-query";

const fetchPayload = async (
	token: string,
	userId: number
): Promise<DicoFavoritesResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/favorite-dicos?filters[userId][$eq]=${userId}&populate=*`,
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
		console.error("Error fetching Fav Metiers:", error);
		throw error;
	}
};

const useGetFavoriteDicos = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<DicoFavoritesResponse>({
		queryKey: ["DicoFavorites", userId],
		queryFn: () => fetchPayload(token!, userId),
		enabled: !!token && !!userId,
	});
};

export default useGetFavoriteDicos;
