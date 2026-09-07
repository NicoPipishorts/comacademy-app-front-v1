import { buildEmptyPlaylist, groupPlaylistContents } from "@/helpers/playlists";
import useJwtToken from "@/hooks/useJwtToken";
import { PlaylistContentGrouped } from "@/types/playlists";
import { useQuery } from "@tanstack/react-query";

/**
 * Strapi 5 addresses playlists by `documentId`. The draft version is read on
 * purpose: the custom list routes (`/playlists/user/:id`,
 * `/playlists/:user/:type/:id`) return draft rows, and contents attached by
 * numeric id before this fix only exist on the draft.
 */
const fetchData = async (
	token: string,
	documentId: string
): Promise<PlaylistContentGrouped> => {
	const params = new URLSearchParams({
		status: "draft",
		populate: "playlist_contents.dico,playlist_contents.metier,playlist_contents.question",
	});
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/playlists/${documentId}?${params.toString()}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		if (response.status === 404) {
			return buildEmptyPlaylist(documentId);
		}
		console.error(
			`Error fetching Playlists! status: ${response.status}`,
			await response.text()
		);
		throw new Error(`Error fetching Playlists! status: ${response.status}`);
	}

	return groupPlaylistContents(await response.json(), documentId);
};

const useGetPlaylistById = (documentId: string | null | undefined) => {
	const { token } = useJwtToken();

	return useQuery<PlaylistContentGrouped>({
		queryKey: ["Playlist", documentId ?? null],
		queryFn: () => fetchData(token!, documentId as string),
		enabled: !!token && !!documentId,
	});
};

export default useGetPlaylistById;
