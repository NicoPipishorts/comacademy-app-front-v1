export interface PlaylistsResponse {
	data: PlaylistsData[];
}

export interface PlaylistsData {
	id: number;
	attributes: PlaylistsAttributes;
}

export interface PlaylistsAttributes {
	name: string;
	selectedColor: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}
