import { DailyCitationResponse } from "@/types/lesCitations";
import { useQuery } from "@tanstack/react-query";
import useJwtToken from "../useJwtToken";

const fetchCitations = async (
	token: string
): Promise<DailyCitationResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/citations/daily`,
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

const useDailyCitations = () => {
	const { token } = useJwtToken();
	return useQuery<DailyCitationResponse>({
		queryKey: ["DailyCitations"],
		queryFn: () => fetchCitations(token),
		enabled: !!token,
		staleTime: 5000,
	});
};

export default useDailyCitations;
