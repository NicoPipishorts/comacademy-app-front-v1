import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId"; // Assuming you have a hook for userId
import { FeedPayload } from "@/types/feed";
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchData = async ({
	pageParam = 1, // Default to page 1
	token,
	userId,
}: {
	pageParam: number;
	token: string;
	userId: number;
}): Promise<FeedPayload> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/feeds/byUserId/${userId}?sort[0]=createdAt:desc&pagination[page]=${pageParam}&pagination[pageSize]=10`,
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
		console.error("Error fetching the feed:", error);
		throw error;
	}
};

const useGetInfiniteFeed = () => {
	const { token } = useJwtToken();
	const { userId } = useUserId(); // Use the userId hook or context

	return useInfiniteQuery<FeedPayload, Error>({
		queryKey: ["Feed", userId], // Include userId in the queryKey for caching
		queryFn: ({ pageParam = 0 }) => {
			const validPageParam = typeof pageParam === "number" ? pageParam : 0;
			return fetchData({
				pageParam: validPageParam,
				token: token!,
				userId, // Pass userId here
			});
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			// Use meta to determine the next page
			const { page, pageCount } = lastPage.meta; // Adjusted to use lastPage.meta directly
			return page < pageCount ? page + 1 : undefined; // Fetch the next page if available
		},
		enabled: !!token && !!userId, // Ensure both token and userId are available
	});
};

export default useGetInfiniteFeed;
