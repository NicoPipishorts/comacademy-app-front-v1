import useJwtToken from "@/hooks/useJwtToken";
import { useQuery } from "@tanstack/react-query";

const fetchCitations = async (token: string): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/citations?random=true&pagination[limit]=30`,
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
		console.error("Error fetching categories:", error);
		throw error;
	}
};

const useLesCitations = () => {
	const { token } = useJwtToken();

	return useQuery<LesCitationsPayload>({
		queryKey: ["Categories"],
		queryFn: () => fetchCitations(token),
		enabled: !!token,
	});
};

export default useLesCitations;
