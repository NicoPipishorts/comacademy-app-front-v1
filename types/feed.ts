export interface FeedPayload {
	data: FeedItem[]; // Array of feed items
	meta: FeedMeta; // Pagination metadata
}

export interface FeedItem {
	id: number; // Unique ID of the feed item
	type: FeedType; // Type of feed
	elementId: string; // Element identifier
	payload: Record<string, any>; // Flexible structure for payload content
	createdAt: string; // Creation timestamp
	updatedAt: string; // Update timestamp
	likes: number | null; // Number of likes or null
	userLiked: boolean; // Whether the user liked the feed item
}

export type FeedType =
	| "metier"
	| "question"
	| "citation"
	| "secret"
	| "dico"
	| "commandement"; // Allowed feed types

export interface FeedMeta {
	page: number; // Current page number
	pageSize: number; // Number of items per page
	pageCount: number; // Total number of pages
	total: number; // Total number of items
}
