import useJwtToken from "@/hooks/useJwtToken";
import { PlaylistResponse } from "@/types/playlists";
import { useQuery } from "@tanstack/react-query";

const fetchData = async (
	token: string,
	id: number
): Promise<PlaylistResponse> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/playlists/${id}?populate=playlist_contents`,
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

const useGetPlaylistById = (id: number) => {
	const { token } = useJwtToken();

	return useQuery<PlaylistResponse>({
		queryKey: ["Playlist", id],
		queryFn: () => fetchData(token!, id),
		enabled: !!token && !!id,
	});
};

export default useGetPlaylistById;
