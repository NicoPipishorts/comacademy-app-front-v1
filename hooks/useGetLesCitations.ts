import { CitationsResponse } from "@/types/lesCitations";
import { useQuery } from "@tanstack/react-query";

const fetchCitations = async (token: string): Promise<CitationsResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/citations?filters[VISIBLE][$eq]=true&sort=updatedAt:desc`,
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

const useLesCitations = (token: string) => {
	return useQuery<CitationsResponse>({
		queryKey: ["Citations"],
		queryFn: () => fetchCitations(token),
		enabled: !!token,
		staleTime: 5000,
	});
};

export default useLesCitations;
