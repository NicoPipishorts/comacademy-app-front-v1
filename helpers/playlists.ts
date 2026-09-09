import {
	entityAttributes,
	normalizeEntity,
	relationEntity,
	relationItems,
} from "@/helpers/strapiEntity";
import { PlaylistContentGrouped } from "@/types/playlists";

type PlaylistContentItem =
	PlaylistContentGrouped["data"]["attributes"]["playlist_contents"][number];

const CONTENT_RELATIONS: {
	key: "metier" | "dico" | "question";
	field: string;
	group: PlaylistContentItem["group"];
}[] = [
	{ key: "metier", field: "METIER", group: "métier" },
	{ key: "dico", field: "Word", group: "dico" },
	{ key: "question", field: "QUESTION", group: "question" },
];

export const buildEmptyPlaylist = (
	documentId: string,
): PlaylistContentGrouped => ({
	data: {
		id: 0,
		documentId,
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

/**
 * Flattens a `GET /playlists/:documentId?populate=playlist_contents.*` payload
 * (Strapi 4 or Strapi 5 shape) into the grouped structure the playlist screen
 * renders: one row per content with the related item's label and group.
 */
export const groupPlaylistContents = (
	payload: unknown,
	fallbackDocumentId = "",
): PlaylistContentGrouped => {
	const playlist = normalizeEntity(
		payload && typeof payload === "object"
			? (payload as { data?: unknown }).data
			: undefined,
	);
	if (!playlist) return buildEmptyPlaylist(fallbackDocumentId);

	const { playlist_contents, ...attributes } = playlist.attributes;
	const contents: PlaylistContentItem[] = [];

	for (const raw of relationItems(playlist_contents)) {
		const content = normalizeEntity(raw);
		if (!content) continue;

		for (const relation of CONTENT_RELATIONS) {
			const item = relationEntity(content.attributes[relation.key]);
			if (!item) continue;
			const label = entityAttributes(item)[relation.field];
			contents.push({
				id: content.id,
				documentId: content.documentId,
				itemId: item.id,
				itemDocumentId: item.documentId,
				value: typeof label === "string" ? label : "",
				group: relation.group,
			});
		}
	}

	return {
		data: {
			id: playlist.id,
			documentId: playlist.documentId ?? fallbackDocumentId,
			attributes: {
				name: typeof attributes.name === "string" ? attributes.name : "",
				createdAt:
					typeof attributes.createdAt === "string" ? attributes.createdAt : "",
				updatedAt:
					typeof attributes.updatedAt === "string" ? attributes.updatedAt : "",
				publishedAt:
					typeof attributes.publishedAt === "string"
						? attributes.publishedAt
						: "",
				selectedColor:
					typeof attributes.selectedColor === "string"
						? attributes.selectedColor
						: "",
				playlist_contents: contents,
			},
		},
	};
};
