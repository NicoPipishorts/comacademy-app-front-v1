import useJwtToken from "@/hooks/useJwtToken";
import { PlaylistListResponse } from "@/types/playlists";
import { useQuery } from "@tanstack/react-query";

const fetchData = async (
	token: string,
	userId: number,
	type: string,
	elementId: number
): Promise<PlaylistListResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/playlists/${userId}/${type}/${elementId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			// Check if it's a 404 error and handle it gracefully
			if (response.status === 404) {
				return null;
			}

			console.error(
				`Error fetching Playlists! status: ${response.status}`,
				await response.text()
			);
			throw new Error(`Error fetching Playlists! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching Playlists:", error);
		throw error;
	}
};

const useGetPlaylistsForElement = (
	userId: number,
	type: string,
	elementId: number
) => {
	const { token } = useJwtToken();

	return useQuery<PlaylistListResponse>({
		queryKey: ["Playlists", userId],
		queryFn: () => fetchData(token!, userId, type, elementId),
		enabled: !!token && !!userId,
	});
};

export default useGetPlaylistsForElement;
