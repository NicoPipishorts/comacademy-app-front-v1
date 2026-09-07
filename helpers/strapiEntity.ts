/**
 * Helpers to read Strapi entities whatever the response format is.
 *
 * Strapi 4 wrapped an entity as `{ id, attributes: { ...fields, relation: { data: [...] } } }`.
 * Strapi 5 (the backend since December 2025) returns it flat:
 * `{ id, documentId, ...fields, relation: [...] }`.
 *
 * Screens and cards in the app were written against the Strapi 4 shape, so
 * these helpers normalise both shapes into `{ id, documentId, attributes }`.
 */

export type StrapiEntityLike = {
	id?: number | string;
	documentId?: string;
	attributes?: Record<string, unknown> | null;
} & Record<string, unknown>;

export type NormalizedEntity<
	T extends Record<string, unknown> = Record<string, unknown>,
> = {
	id: number;
	documentId?: string;
	attributes: T;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const toNumericId = (value: unknown): number | null => {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : null;
};

/**
 * Returns the field bag of an entity: `entity.attributes` for the Strapi 4
 * shape, the entity itself (minus `id`/`documentId`) for the Strapi 5 shape.
 */
export const entityAttributes = (
	entity: unknown,
): Record<string, unknown> => {
	if (!isObject(entity)) return {};
	if (isObject(entity.attributes)) return entity.attributes;
	const { id: _id, documentId: _documentId, ...rest } = entity;
	return rest;
};

/**
 * Normalises one entity (either shape) into `{ id, documentId, attributes }`.
 * Returns `null` when the value is not an entity with a numeric id.
 */
export const normalizeEntity = <
	T extends Record<string, unknown> = Record<string, unknown>,
>(
	entity: unknown,
): NormalizedEntity<T> | null => {
	if (!isObject(entity)) return null;
	const id = toNumericId(entity.id);
	if (id === null) return null;
	const documentId =
		typeof entity.documentId === "string" ? entity.documentId : undefined;
	return { id, documentId, attributes: entityAttributes(entity) as T };
};

/**
 * Returns the items of a relation field for both shapes:
 * Strapi 4 `{ data: [...] }` / `{ data: {...} }` and Strapi 5 `[...]` / `{...}`.
 */
export const relationItems = (value: unknown): unknown[] => {
	if (Array.isArray(value)) return value;
	if (!isObject(value)) return [];
	if ("data" in value) {
		const data = value.data;
		if (Array.isArray(data)) return data;
		return isObject(data) ? [data] : [];
	}
	return [value];
};

/** First item of a relation, normalised, or `null` when the relation is empty. */
export const relationEntity = <
	T extends Record<string, unknown> = Record<string, unknown>,
>(
	value: unknown,
): NormalizedEntity<T> | null => {
	const [first] = relationItems(value);
	return normalizeEntity<T>(first);
};

export type FavoriteRow<
	T extends Record<string, unknown> = Record<string, unknown>,
> = {
	id: number;
	documentId?: string;
	items: NormalizedEntity<T>[];
};

/**
 * Reads a favorites collection response (`favorite-dicos`, `favorite-metiers`,
 * `favorite-questions`) into rows of normalised related items.
 */
export const normalizeFavoriteRows = <
	T extends Record<string, unknown> = Record<string, unknown>,
>(
	payload: unknown,
	relationKey: string,
): FavoriteRow<T>[] => {
	const data = isObject(payload) ? payload.data : undefined;
	if (!Array.isArray(data)) return [];

	const rows: FavoriteRow<T>[] = [];
	for (const raw of data) {
		const row = normalizeEntity(raw);
		if (!row) continue;
		const items = relationItems(row.attributes[relationKey])
			.map((item) => normalizeEntity<T>(item))
			.filter((item): item is NormalizedEntity<T> => item !== null);
		rows.push({ id: row.id, documentId: row.documentId, items });
	}
	return rows;
};

/** Unique related items across every row, first occurrence wins. */
export const collectFavoriteItems = <
	T extends Record<string, unknown> = Record<string, unknown>,
>(
	rows: FavoriteRow<T>[],
): NormalizedEntity<T>[] => {
	const seen = new Set<number>();
	const items: NormalizedEntity<T>[] = [];
	for (const row of rows) {
		for (const item of row.items) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			items.push(item);
		}
	}
	return items;
};

/** Unique related ids across every row. */
export const collectFavoriteIds = (rows: FavoriteRow[]): number[] =>
	collectFavoriteItems(rows).map((item) => item.id);

/**
 * The row that should receive updates. Users can own several rows because of
 * historical duplicates; the most recent one (highest id) is the target.
 */
export const latestFavoriteRow = <
	T extends Record<string, unknown> = Record<string, unknown>,
>(
	rows: FavoriteRow<T>[],
): FavoriteRow<T> | null => {
	let latest: FavoriteRow<T> | null = null;
	for (const row of rows) {
		if (!latest || row.id > latest.id) latest = row;
	}
	return latest;
};

/**
 * Identifier to use in a REST URL for an entity. Strapi 5 only accepts the
 * `documentId`; the numeric id is kept as a fallback for older backends.
 */
export const entityRouteId = (entity: {
	id?: number;
	documentId?: string | null;
}): string | number | null => {
	if (typeof entity.documentId === "string" && entity.documentId.length > 0) {
		return entity.documentId;
	}
	return typeof entity.id === "number" ? entity.id : null;
};
