import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { FeedPayload } from "@/types/feed";
import { useInfiniteQuery } from "@tanstack/react-query";

// Function to fetch feed data
const fetchData = async ({
	token,
	userId,
	pageParam = 0,
	limit,
}: {
	token: string;
	userId: number;
	pageParam?: number;
	limit: number;
}): Promise<FeedPayload> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/feeds/byUserId/${userId}?start=${pageParam}&limit=${limit}&sort[0]=createdAt:desc`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Error fetching the feed! Status: ${response.status}`);
		}

		const data: FeedPayload = await response.json();
		return data;
	} catch (error) {
		throw error;
	}
};

// Custom hook for infinite scrolling
const useGetFeed = ({ limit = 10 }: { limit?: number } = {}) => {
	const { token } = useJwtToken();
	const { userId } = useUserId();

	return useInfiniteQuery<FeedPayload, Error>({
		queryKey: ["Feed", userId],
		queryFn: ({ pageParam = 0 }) => {
			return fetchData({
				token: token!,
				userId,
				pageParam,
				limit,
			});
		},
		enabled: !!token && !!userId,
		getNextPageParam: (lastPage) => {
			const { start, limit, total } = lastPage.meta.pagination;

			if (start + limit < total) {
				return start + limit;
			} else {
				return undefined;
			}
		},
		initialPageParam: 0,
		staleTime: 5 * 60 * 1000,
	});
};

export default useGetFeed;
