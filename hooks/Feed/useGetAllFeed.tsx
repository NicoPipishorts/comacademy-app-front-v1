import useJwtToken from "@/hooks/useJwtToken";
import { FeedPayload } from "@/types/feed";
import { QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import useAuthSession from "../useAuthSession";

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
	const { auth } = useAuthSession();

	return useInfiniteQuery<
		FeedPayload, // TQueryFnData
		Error, // TError
		FeedPayload, // TData
		QueryKey, // TQueryKey
		number // TPageParam  <<— key part
	>({
		queryKey: ["Feed", auth?.user?.id],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			fetchData({
				token: token!,
				userId: auth!.user.id as number,
				pageParam,
				limit,
			}),
		enabled: !!token && !!auth?.user?.id,
		getNextPageParam: (lastPage) => {
			const { start, limit, total } = lastPage.meta.pagination;
			return start + limit < total ? start + limit : undefined;
		},
		staleTime: 5 * 60 * 1000,
	});
};

export default useGetFeed;
