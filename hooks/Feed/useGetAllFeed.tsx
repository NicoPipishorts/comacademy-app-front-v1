import useJwtToken from "@/hooks/useJwtToken";
import { FeedPayload } from "@/types/feed";
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchData = async ({
	pageParam = 0,
	token,
}: {
	pageParam: number;
	token: string;
}): Promise<FeedPayload> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/feeds?sort[0]=createdAt:desc&pagination[start]=${pageParam}&pagination[limit]=15`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Error fetching the feed! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching the feed:", error);
		throw error;
	}
};

const useGetInfiniteFeed = () => {
	const { token } = useJwtToken();

	return useInfiniteQuery<FeedPayload, Error>({
		queryKey: ["Feed"],
		queryFn: ({ pageParam = 0 }) => {
			const validPageParam = typeof pageParam === "number" ? pageParam : 0;
			return fetchData({ pageParam: validPageParam, token: token! });
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage?.meta?.pagination) {
				return undefined;
			}

			const currentTotalFetched = allPages.flatMap((page) => page.data).length;

			if (currentTotalFetched < lastPage.meta.pagination.total) {
				return currentTotalFetched; // Next page index
			}

			return undefined; // No more pages
		},
		enabled: !!token,
	});
};

export default useGetInfiniteFeed;
