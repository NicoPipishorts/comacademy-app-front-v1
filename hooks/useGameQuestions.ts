import useJwtToken from "@/hooks/useJwtToken";
import { GameDataPayload } from "@/types/game";
import { useQuery } from "@tanstack/react-query";

const fetchGameQuestions = async (token: string, userId: number) => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/random-questions?userId=${userId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`Error fetching game questions: status: ${response.status}`,
				await response.text()
			);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Since CATEGORIE is now already a number, no need to split or randomize it.
		const transformedData = {
			...data,
			data: data.data.map((item: any) => ({
				...item,
				attributes: {
					...item.attributes,
					// CATEGORIE is already a number, no need to modify it
					CATEGORIE: item.attributes.CATEGORIE || 1, // Fallback to 1 if CATEGORIE is missing
				},
			})),
		};

		return transformedData;
	} catch (error) {
		console.error("Error fetching game questions:", error);
		throw error;
	}
};

const useGameQuestions = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<GameDataPayload>({
		queryKey: ["GameQuestions", userId],
		queryFn: () => fetchGameQuestions(token, userId),
		enabled: !!token && !!userId,
	});
};

export default useGameQuestions;
