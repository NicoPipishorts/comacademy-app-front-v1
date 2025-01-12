export interface FeedPayload {
	data: {
		id: number;
		attributes: FeedAttributes;
	}[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

export interface FeedAttributes {
	type: "metier" | "question" | "citation" | "secret" | "dico" | "commandement";
	elementId: string;
	payload: Record<string, any>;
	createdAt: string;
	updatedAt: string;
	likes: number | null;
}
