export interface Card {
	id: number;
	titre: string;
	contenus: string;
	cta: string | null;
	headerCard?: boolean;
}

export interface SecretsData {
	id: number;
	Brand: string;
	Title: string;
	Active: boolean;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	documentId: string;
	/** Only present on the single‑item response */
	Cards?: Card[];
	/** Only present on the list response */
	imageUrl?: string;
	CardImage?: any;
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
