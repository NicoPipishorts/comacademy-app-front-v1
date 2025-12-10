import useJwtToken from "@/hooks/useJwtToken";
import { CategoriePayload } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";

const fetchCategories = async (token: string): Promise<CategoriePayload> => {
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

		const raw = (await response.json()) as CategoriePayload;

		// Transform the payload to replace IDs
		const data: CategoriePayload = {
			...raw,
			data: raw.data.map((item, index) => ({
				...item,
				id: index + 1, // Replace id with index + 1
			})),
		};

		return data;
	} catch (error) {
		console.error("Error fetching categories Full:", error);
		throw error;
	}
};

const useCategoriesFull = () => {
	const { token } = useJwtToken();

	return useQuery<CategoriePayload>({
		queryKey: ["CategoriesFull"],
		queryFn: () => fetchCategories(token),
		enabled: !!token,
	});
};

export default useCategoriesFull;
