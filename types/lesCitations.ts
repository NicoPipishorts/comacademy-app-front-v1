export interface CitationAttributes {
	AUTEUR: string;
	CATEGORIE: string;
	createdAt: string;
	updatedAt: string;
	CITATION: string;
}

export interface CitationData {
	id: number;
	attributes: CitationAttributes;
}

export interface CitationsResponse {
	data: CitationData[];
}

export interface CitationResponse {
	data: CitationData;
}
