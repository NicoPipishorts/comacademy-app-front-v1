export interface Card {
	id: number;
	titre: string;
	contenus: string;
	cta: string | null;
	headerCard: boolean;
}

export interface SecretAttributes {
	Title: string;
	Brand: string;
	Active: boolean;
	/** Only present on the single‑item response */
	Cards?: Card[];
	/** Only present on the list response */
	imageUrl?: string;
}

export interface SecretsData {
	id: number;
	attributes: SecretAttributes;
}

export interface Pagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface Meta {
	pagination: Pagination;
}

/**
 * GET /secrets
 *
 * Returns an array of secrets plus pagination info.
 */
export interface SecretsResponse {
	data: SecretsData[];
	meta: Meta;
}

/**
 * GET /secrets/:id
 *
 * Returns a single secret, including its Cards array.
 */
export interface SecretResponse {
	data: SecretsData;
}
