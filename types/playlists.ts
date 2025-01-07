export interface PlaylistsResponse {
	data: PlaylistsData[];
	meta: PlaylistsMeta;
}

export interface PlaylistsData {
	id: number;
	attributes: PlaylistsAttributes;
}

export interface PlaylistsAttributes {
	name: string;
	createdAt: string; // ISO 8601 DateTime string
	updatedAt: string; // ISO 8601 DateTime string
	publishedAt: string; // ISO 8601 DateTime string
}

export interface PlaylistsMeta {
	pagination: PlaylistsPagination;
}

export interface PlaylistsPagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}
