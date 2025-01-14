import useJwtToken from "@/hooks/useJwtToken";
import { CategoriePayload } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";

const fetchCategories = async (token: string): Promise<CategoriePayload> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/categories?populate=*&sort=id:asc`,
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

		// Transform the payload to replace IDs
		data.data = data.data.map((item: any, index: number) => ({
			...item,
			id: index + 1, // Replace id with index + 1
		}));

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
