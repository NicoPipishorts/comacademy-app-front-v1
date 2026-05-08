import { buildApiUrl } from "@/helpers/api/buildApiUrl";
import useJwtToken from "@/hooks/useJwtToken";
import { DicoPayload } from "@/types/dico";
import { useQuery } from "@tanstack/react-query";

const fetchCitations = async (token: string): Promise<DicoPayload> => {
	try {
		const response = await fetch(
			buildApiUrl(
				"/dicos?filters[aLaUne][$eq]=true&sort=updatedAt:desc&pagination[limit]=1"
			),
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
		console.error("Error fetching La Citation Dico:", error);
		throw error;
	}
};

const useGetOneDico = () => {
	const { token } = useJwtToken();

	return useQuery<DicoPayload>({
		queryKey: ["LeDico"],
		queryFn: () => fetchCitations(token),
		enabled: !!token,
		staleTime: 5000,
	});
};

export default useGetOneDico;
