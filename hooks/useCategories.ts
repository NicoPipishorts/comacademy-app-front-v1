// src/hooks/useCategories.ts

import useJwtToken from "@/hooks/useJwtToken";
import { CategorieColors } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";

const fetchCategories = async (token: string): Promise<CategorieColors> => {
	try {
		const url = `${process.env.EXPO_PUBLIC_API_URL}/categories/categoriesFullCustom`;

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const text = await response.text();
			console.error(`Categories HTTP error! status: ${response.status}`, text);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as CategorieColors;

		return data;
	} catch (error) {
		console.error("Error fetching Categories by ID:", error);
		throw error;
	}
};

const useCategories = () => {
	const { token } = useJwtToken();

	return useQuery<CategorieColors>({
		queryKey: ["Categories"],
		queryFn: () => fetchCategories(token),
		enabled: !!token,
		initialData: { data: [] },
	});
};

export default useCategories;
