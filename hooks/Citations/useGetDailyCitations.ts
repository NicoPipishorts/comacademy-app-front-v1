import { DailyCitationResponse } from "@/types/lesCitations";
import { useQuery } from "@tanstack/react-query";
import useJwtToken from "../useJwtToken";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchCitations = async (
	token: string
): Promise<DailyCitationResponse> => {
	try {
		const url = buildApiUrl("citations/daily");
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

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
