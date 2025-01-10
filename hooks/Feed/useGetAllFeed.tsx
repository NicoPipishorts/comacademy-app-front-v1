import useJwtToken from "@/hooks/useJwtToken";
import { FeedPayload } from "@/types/feed";
import { useQuery } from "@tanstack/react-query";

const fetchData = async (token: string): Promise<FeedPayload> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/feeds?sort[0]=createdAt:desc`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}

			console.error(
				`Errror fetching the feed! status: ${response.status}`,
				await response.text()
			);
			throw new Error(`Errror fetching the feed! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Errror fetching the feed:", error);
		throw error;
	}
};

const useGetAllFeed = () => {
	const { token } = useJwtToken();

	return useQuery<FeedPayload>({
		queryKey: ["Feed"],
		queryFn: () => fetchData(token!),
		enabled: !!token,
	});
};

export default useGetAllFeed;
