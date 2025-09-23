// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { CategorieColors } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";

const fetchCategories = async (token: string): Promise<CategorieColors> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/categories?fields[0]=backgroundColor&fields[1]=staticId&populate[smallIcon][fields][0]=url`,
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
		console.error("Error fetching  Categories by ID:", error);
		throw error;
	}
};

const useCategories = () => {
	const { token } = useJwtToken();

	return useQuery<CategorieColors>({
		queryKey: ["Categories"],
		queryFn: () => fetchCategories(token),
		enabled: !!token,
	});
};

export default useCategories;
