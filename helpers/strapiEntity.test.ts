import {
	collectFavoriteIds,
	collectFavoriteItems,
	entityAttributes,
	entityRouteId,
	latestFavoriteRow,
	normalizeEntity,
	normalizeFavoriteRows,
	relationEntity,
	relationItems,
} from "./strapiEntity";

const v5Favorites = {
	data: [
		{
			id: 50,
			documentId: "j2ql6rii98xecoqsgvusv72m",
			userId: "735",
			words: [
				{ id: 5387, documentId: "ouh0n6aulw98kp4n1zy7yx7p", Word: "Animation 3D" },
				{ id: 12, documentId: "abc", Word: "Brief" },
			],
		},
		{
			id: 44,
			documentId: "olderrow",
			userId: "735",
			words: [{ id: 12, documentId: "abc", Word: "Brief" }],
		},
	],
	meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 2 } },
};

const v4Favorites = {
	data: [
		{
			id: 50,
			attributes: {
				userId: "735",
				words: {
					data: [{ id: 5387, attributes: { Word: "Animation 3D" } }],
				},
			},
		},
	],
};

describe("entityAttributes", () => {
	it("reads Strapi 4 attributes", () => {
		expect(entityAttributes({ id: 1, attributes: { Word: "a" } })).toEqual({
			Word: "a",
		});
	});

	it("reads Strapi 5 flat fields without id/documentId", () => {
		expect(entityAttributes({ id: 1, documentId: "x", Word: "a" })).toEqual({
			Word: "a",
		});
	});

	it("returns an empty bag for non-objects", () => {
		expect(entityAttributes(null)).toEqual({});
		expect(entityAttributes("nope")).toEqual({});
	});
});

describe("normalizeEntity", () => {
	it("normalises both shapes", () => {
		expect(normalizeEntity({ id: 1, attributes: { Word: "a" } })).toEqual({
			id: 1,
			documentId: undefined,
			attributes: { Word: "a" },
		});
		expect(normalizeEntity({ id: "2", documentId: "d", Word: "b" })).toEqual({
			id: 2,
			documentId: "d",
			attributes: { Word: "b" },
		});
	});

	it("rejects values without a numeric id", () => {
		expect(normalizeEntity({ attributes: {} })).toBeNull();
		expect(normalizeEntity(undefined)).toBeNull();
	});
});

describe("relationItems / relationEntity", () => {
	it("handles v4 collections and single relations", () => {
		expect(relationItems({ data: [{ id: 1 }, { id: 2 }] })).toHaveLength(2);
		expect(relationItems({ data: { id: 1 } })).toHaveLength(1);
		expect(relationItems({ data: null })).toEqual([]);
	});

	it("handles v5 arrays, objects and null", () => {
		expect(relationItems([{ id: 1 }])).toHaveLength(1);
		expect(relationItems({ id: 1, Word: "a" })).toHaveLength(1);
		expect(relationItems(null)).toEqual([]);
		expect(relationItems(undefined)).toEqual([]);
	});

	it("relationEntity returns the first normalised item", () => {
		expect(relationEntity({ data: { id: 3, attributes: { Word: "c" } } })).toEqual(
			{ id: 3, documentId: undefined, attributes: { Word: "c" } },
		);
		expect(relationEntity(null)).toBeNull();
	});
});

describe("normalizeFavoriteRows", () => {
	it("reads the Strapi 5 flat response", () => {
		const rows = normalizeFavoriteRows<{ Word: string }>(v5Favorites, "words");
		expect(rows).toHaveLength(2);
		expect(rows[0].id).toBe(50);
		expect(rows[0].documentId).toBe("j2ql6rii98xecoqsgvusv72m");
		expect(rows[0].items.map((i) => i.attributes.Word)).toEqual([
			"Animation 3D",
			"Brief",
		]);
	});

	it("still reads the Strapi 4 wrapped response", () => {
		const rows = normalizeFavoriteRows<{ Word: string }>(v4Favorites, "words");
		expect(rows).toHaveLength(1);
		expect(rows[0].items[0]).toEqual({
			id: 5387,
			documentId: undefined,
			attributes: { Word: "Animation 3D" },
		});
	});

	it("returns no rows for empty or malformed payloads", () => {
		expect(normalizeFavoriteRows({ data: [] }, "words")).toEqual([]);
		expect(normalizeFavoriteRows({ data: null }, "words")).toEqual([]);
		expect(normalizeFavoriteRows(undefined, "words")).toEqual([]);
	});

	it("merges ids across rows and picks the latest row for updates", () => {
		const rows = normalizeFavoriteRows(v5Favorites, "words");
		expect(collectFavoriteIds(rows)).toEqual([5387, 12]);
		expect(collectFavoriteItems(rows).map((i) => i.id)).toEqual([5387, 12]);
		expect(latestFavoriteRow(rows)?.documentId).toBe("j2ql6rii98xecoqsgvusv72m");
		expect(latestFavoriteRow([])).toBeNull();
	});
});

describe("entityRouteId", () => {
	it("prefers the documentId and falls back to the numeric id", () => {
		expect(entityRouteId({ id: 5, documentId: "doc" })).toBe("doc");
		expect(entityRouteId({ id: 5, documentId: "" })).toBe(5);
		expect(entityRouteId({ id: 5 })).toBe(5);
		expect(entityRouteId({})).toBeNull();
	});
});
