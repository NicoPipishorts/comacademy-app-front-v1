export interface DicoPayload {
	data: DicoDataItem;
}

export interface DicoDataItem {
	id: number;
	attributes: DicoAttributes;
}

export interface DicoAttributes {
	Categories: string;
	Tags: string;
	Word: string;
	Definition: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface DicoSelected {
	id: number;
	Word: string;
}

export interface DicoLists {
	data: {
		id: number;
		attributes: {
			Word: string;
		};
	}[];
}
export interface DicoFavoritesWordAttributes extends DicoAttributes {
	Coef: number | null;
}

export interface DicoFavoritesWord {
	id: number;
	attributes: DicoFavoritesWordAttributes;
}

export interface DicoFavoritesWordsData {
	data: DicoFavoritesWord[];
}

export interface DicoFavoritesAttributes {
	userId: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	words: DicoFavoritesWordsData;
}

export interface DicoFavoritesDataItem {
	id: number;
	attributes: DicoFavoritesAttributes;
}

export interface DicoFavoritesPagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface DicoFavoritesMeta {
	pagination: DicoFavoritesPagination;
}

export interface DicoFavoritesResponse {
	data: DicoFavoritesDataItem[];
	meta: DicoFavoritesMeta;
}
