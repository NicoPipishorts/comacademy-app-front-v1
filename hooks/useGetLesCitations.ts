import useJwtToken from "@/hooks/useJwtToken";
import { CitationResponse } from "@/types/lesCitations";
import { useQuery } from "@tanstack/react-query";

const fetchCitations = async (token: string): Promise<CitationResponse> => {
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

const useLesCitations = () => {
	const { token } = useJwtToken();

	return useQuery<CitationResponse>({
		queryKey: ["Citations"],
		queryFn: () => fetchCitations(token),
		enabled: !!token,
	});
};

export default useLesCitations;
