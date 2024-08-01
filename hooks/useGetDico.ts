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
		console.error("Error fetching categories:", error);
		throw error;
	}
};

const useDicoById = (id: number) => {
	const { token } = useJwtToken();

	return useQuery<DicoPayload>({
		queryKey: ["Dico"],
		queryFn: () => fetchDicoById(token, id),
		enabled: !!token,
	});
};

const fetchDicoIds = async (token: string): Promise<any> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/dicos?fields[0]=Word&_fields=id,Word`,
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

const useDicoIds = () => {
	const { token } = useJwtToken();

	return useQuery<DicoLists>({
		queryKey: ["DicoIds"],
		queryFn: () => fetchDicoIds(token),
		enabled: !!token,
	});
};

export { useDicoById, useDicoIds };
