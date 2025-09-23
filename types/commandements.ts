// src/types/commandement.ts

/** --- Shared --- */
export interface CommandementCard {
	id: number;
	titre: string;
	contenus: string;
	cta: string | null;
	headerCard: boolean;
}

/** --- Single‐item response --- */
export interface SingleCommandementAttributes {
	Theme: string;
	Active: boolean;
	cards: CommandementCard[];
}

export interface SingleCommandementData {
	id: number;
	attributes: SingleCommandementAttributes;
}

export interface SingleCommandementResponse {
	data: SingleCommandementData;
}

/** --- List response --- */
export interface ListCommandementAttributes {
	Theme: string;
	Active: boolean;
	imageUrl: string | null;
	catName: string | null;
}

export interface ListCommandementData {
	id: number;
	attributes: ListCommandementAttributes;
}

export interface PaginationMeta {
	pagination: {
		page: number;
		pageSize: number;
		pageCount: number;
		total: number;
	};
}

export interface MultipleCommandementsResponse {
	data: ListCommandementData[];
	meta: PaginationMeta;
}
