import { CitationsResponse } from "@/types/lesCitations";
import { useQuery } from "@tanstack/react-query";
import useJwtToken from "../useJwtToken";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchCitations = async (
	token: string,
	category: string
): Promise<CitationsResponse> => {
	console.log(category);
	try {
		const url = buildApiUrl(
			`citations/by-category/${encodeURIComponent(category)}`
		);
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

		const responseData = await response.json();
		return responseData as CitationsResponse;
	} catch (error) {
		console.error("Error fetching Les Cistations:", error);
		throw error;
	}
};

const useLesCitations = (category: string) => {
	const { token } = useJwtToken();
	return useQuery<CitationsResponse>({
		queryKey: ["Citations", { category }],
		queryFn: () => fetchCitations(token, category),
		enabled: !!token,
		staleTime: 1000,
		refetchOnWindowFocus: true,
		refetchOnMount: true,
		gcTime: 1000,
	});
};

export default useLesCitations;
