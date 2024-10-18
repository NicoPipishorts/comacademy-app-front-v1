import { useQuery } from "@tanstack/react-query";

export type RoundsResponse = {
	data: {
		id: number;
		attributes: RoundAttributes;
	}[];
};

export type RoundAttributes = {
	commentaires: string;
	points: number;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
};

const fetchPayload = async (token: string): Promise<RoundsResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/rounds?sort=id:ASC`,
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
		console.error("Error fetching Les Cistations:", error);
		throw error;
	}
};

const useGetRounds = (token: string) => {
	return useQuery<RoundsResponse>({
		queryKey: ["Rounds"],
		queryFn: () => fetchPayload(token),
		enabled: !!token,
		staleTime: 5000,
	});
};

export default useGetRounds;
