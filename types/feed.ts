export interface FeedPayload {
	data: {
		id: number;
		attributes: FeedAttributes;
	}[];
}

export interface FeedAttributes {
	type: "metier" | "question" | "citation" | "secret" | "dico" | "commandement";
	elementId: string;
	payload: Record<string, any>;
	createdAt: string;
	updatedAt: string;
	likes: number | null;
}
