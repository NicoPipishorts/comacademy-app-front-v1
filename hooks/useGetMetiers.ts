import useJwtToken from "@/hooks/useJwtToken";
import { MetierPayload, MetiersList } from "@/types/metiers";
import { useQuery } from "@tanstack/react-query";

const fetchMetierById = async (token: string, id: number): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/metiers/${id}`,
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
		console.error("Error fetching Metier by ID:", error);
		throw error;
	}
};

const useGetMetierById = (id: number) => {
	const { token } = useJwtToken();

	return useQuery<MetierPayload>({
		queryKey: ["Metier", id],
		queryFn: () => fetchMetierById(token, id),
		staleTime: 1000 * 60 * 60 * 24 * 7,
		gcTime: 1000 * 60 * 60 * 24 * 7,
		enabled: !!token,
	});
};

const fetchMetiers = async (
	token: string,
	filterByCat: number | null
): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/metiers?${
				filterByCat === null
					? "fields[0]=METIER&_fields=id,METIER&pagination[limit]=2500"
					: `fields[0]=METIER&_fields=id,METIER&pagination[limit]=2500&filters[CATEGORIE][$contains]=${filterByCat}`
			}`,
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
		console.error("Error fetching Metiers:", error);
		throw error;
	}
};

const useGetMetiers = (filterByCat: number | null) => {
	const { token } = useJwtToken();

	return useQuery<MetiersList>({
		queryKey: ["metiersList", filterByCat],
		queryFn: () => fetchMetiers(token, filterByCat),
		enabled: !!token,
	});
};

export { useGetMetierById, useGetMetiers };
