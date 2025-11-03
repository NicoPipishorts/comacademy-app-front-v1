import useJwtToken from "@/hooks/useJwtToken";
import { PlaylistContentGrouped } from "@/types/playlists";
import { useQuery } from "@tanstack/react-query";

const buildEmptyResponse = (playlistId: number): PlaylistContentGrouped => ({
	data: {
		id: playlistId,
		attributes: {
			name: "",
			createdAt: "",
			updatedAt: "",
			publishedAt: "",
			selectedColor: "",
			playlist_contents: [],
		},
	},
});

const fetchData = async (
	token: string,
	id: number
): Promise<PlaylistContentGrouped> => {
	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_URL}/playlists/${id}?populate=playlist_contents.dico,playlist_contents.metier,playlist_contents.question`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				return buildEmptyResponse(id);
			}
			console.error(
				`Error fetching Playlists! status: ${response.status}`,
				await response.text()
			);
			throw new Error(`Error fetching Playlists! status: ${response.status}`);
		}

		const data = (await response.json()) as any;

		// Transform the response into the desired flattened structure
		const playlistContents: PlaylistContentGrouped["data"]["attributes"]["playlist_contents"] =
			[];

		data.data.attributes.playlist_contents.data.forEach((item: any) => {
			if (item.attributes.metier?.data) {
				playlistContents.push({
					id: item.id,
					itemId: item.attributes.metier.data.id,
					value: item.attributes.metier.data.attributes.METIER,
					group: "métier",
				});
			}
			if (item.attributes.dico?.data) {
				playlistContents.push({
					id: item.id,
					itemId: item.attributes.dico.data.id,
					value: item.attributes.dico.data.attributes.Word,
					group: "dico",
				});
			}
			if (item.attributes.question?.data) {
				playlistContents.push({
					id: item.id,
					itemId: item.attributes.question.data.id,
					value: item.attributes.question.data.attributes.QUESTION,
					group: "question",
				});
			}
		});

		return {
			data: {
				id: data.data.id,
				attributes: {
					...data.data.attributes,
					playlist_contents: playlistContents,
				},
			},
		};
	} catch (error) {
		console.error("Error fetching Playlists:", error);
		throw error;
	}
};

const useGetPlaylistById = (id: number) => {
	const { token } = useJwtToken();

	return useQuery<PlaylistContentGrouped>({
		queryKey: ["Playlist", id],
		queryFn: () => fetchData(token!, id),
		enabled: !!token && !!id,
	});
};

export default useGetPlaylistById;
