import { buildEmptyPlaylist, groupPlaylistContents } from "./playlists";

const v5Playlist = {
	data: {
		id: 169,
		documentId: "s98qvs85koecfhid4rfvtsgk",
		name: "Claude Test PL",
		selectedColor: "3",
		userId: 735,
		createdAt: "2026-09-04T09:10:55.205Z",
		updatedAt: "2026-09-04T09:16:14.001Z",
		publishedAt: null,
		playlist_contents: [
			{
				id: 208,
				documentId: "p0k2wfqm1oopg8nx1qhczwu7",
				question: null,
				metier: null,
				dico: { id: 5387, documentId: "ouh0n6aulw98kp4n1zy7yx7p", Word: "Animation 3D" },
			},
			{
				id: 209,
				documentId: "m1",
				question: null,
				metier: { id: 7, documentId: "met", METIER: "Community manager" },
				dico: null,
			},
			{
				id: 210,
				documentId: "q1",
				question: { id: 13528, documentId: "qq", QUESTION: "Une question ?" },
				metier: null,
				dico: null,
			},
			{ id: 211, documentId: "orphan", question: null, metier: null, dico: null },
		],
	},
	meta: {},
};

const v4Playlist = {
	data: {
		id: 148,
		attributes: {
			name: "Playlist design",
			selectedColor: "6",
			createdAt: "2025-01-21T23:28:08.927Z",
			updatedAt: "2025-01-21T23:28:08.927Z",
			publishedAt: "2025-01-21T23:28:08.922Z",
			playlist_contents: {
				data: [
					{
						id: 188,
						attributes: {
							question: { data: null },
							metier: { data: null },
							dico: { data: { id: 5387, attributes: { Word: "Animation 3D" } } },
						},
					},
				],
			},
		},
	},
};

describe("groupPlaylistContents", () => {
	it("flattens a Strapi 5 playlist into grouped rows", () => {
		const grouped = groupPlaylistContents(v5Playlist);
		expect(grouped.data.id).toBe(169);
		expect(grouped.data.documentId).toBe("s98qvs85koecfhid4rfvtsgk");
		expect(grouped.data.attributes.name).toBe("Claude Test PL");
		expect(grouped.data.attributes.selectedColor).toBe("3");
		expect(grouped.data.attributes.playlist_contents).toEqual([
			{
				id: 208,
				documentId: "p0k2wfqm1oopg8nx1qhczwu7",
				itemId: 5387,
				itemDocumentId: "ouh0n6aulw98kp4n1zy7yx7p",
				value: "Animation 3D",
				group: "dico",
			},
			{
				id: 209,
				documentId: "m1",
				itemId: 7,
				itemDocumentId: "met",
				value: "Community manager",
				group: "métier",
			},
			{
				id: 210,
				documentId: "q1",
				itemId: 13528,
				itemDocumentId: "qq",
				value: "Une question ?",
				group: "question",
			},
		]);
	});

	it("still reads the Strapi 4 wrapped shape", () => {
		const grouped = groupPlaylistContents(v4Playlist);
		expect(grouped.data.attributes.name).toBe("Playlist design");
		expect(grouped.data.attributes.playlist_contents).toEqual([
			{
				id: 188,
				documentId: undefined,
				itemId: 5387,
				itemDocumentId: undefined,
				value: "Animation 3D",
				group: "dico",
			},
		]);
	});

	it("returns an empty playlist for missing data", () => {
		expect(groupPlaylistContents({ data: null }, "doc")).toEqual(
			buildEmptyPlaylist("doc"),
		);
		expect(groupPlaylistContents(undefined, "doc").data.documentId).toBe("doc");
		expect(
			groupPlaylistContents({ data: { id: 1, documentId: "x", name: "n" } }).data
				.attributes.playlist_contents,
		).toEqual([]);
	});
});
