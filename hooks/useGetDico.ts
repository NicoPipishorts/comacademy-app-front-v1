import useJwtToken from "@/hooks/useJwtToken";
import { DicoLists, DicoPayload } from "@/types/dico";
import { useQuery } from "@tanstack/react-query";

const fetchDicoById = async (token: string, id: number): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/dicos/${id}`,
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
		console.error("Error fetching Dico by Id:", error);
		throw error;
	}
};

const useDicoById = (id: number) => {
	const { token } = useJwtToken();

	return useQuery<DicoPayload>({
		queryKey: ["Dico", id],
		queryFn: () => fetchDicoById(token, id),
		enabled: !!token,
	});
};

const fetchDicoIds = async (
	token: string,
	filterByCat: number | null
): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/dicos?${
				filterByCat === null
					? "fields[0]=Word&_fields=id,Word&pagination[limit]=2500"
					: `fields[0]=Word&_fields=id,Word&pagination[limit]=2500&filters[Categories][$contains]=${filterByCat}`
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
		console.error("Error fetching Dicos:", error);
		throw error;
	}
};

const useDicoIds = (filterByCat: number | null) => {
	const { token } = useJwtToken();

	return useQuery<DicoLists>({
		queryKey: ["DicoIds", filterByCat],
		queryFn: () => fetchDicoIds(token, filterByCat),
		enabled: !!token,
	});
};

export { useDicoById, useDicoIds };
