import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId"; // Assuming you have a hook for userId
import { FeedPayload } from "@/types/feed";
import { useQuery } from "@tanstack/react-query";

const fetchData = async ({
	token,
	userId,
}: {
	token: string;
	userId: number;
}): Promise<FeedPayload> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/feeds/byUserId/${userId}?sort[0]=createdAt:desc`,
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

const useGetFeed = () => {
	const { token } = useJwtToken();
	const { userId } = useUserId(); // Use the userId hook or context

	return useQuery<FeedPayload, Error>({
		queryKey: ["Feed", userId], // Include userId in the queryKey for caching
		queryFn: () => {
			return fetchData({
				token: token!,
				userId, // Pass userId here
			});
		},
		enabled: !!token && !!userId, // Ensure both token and userId are available
		staleTime: 5 * 60 * 1000, // 5 minutes in milliseconds
		refetchOnMount: true, // Force refetch on remount
	});
};

export default useGetFeed;
