export interface CitationAttributes {
	AUTEUR: string;
	CATEGORIE: string;
	CITATION: string;
	createdAt: string;
	updatedAt: string;
}

export interface CitationData {
	id: number;
	attributes: CitationAttributes;
}

export interface CitationsResponse {
	data: {
		cat: string;
		results: { data: CitationData[] };
	};
}

export interface CitationResponse {
	data: CitationData;
}

export interface DailyCitationData {
	id: number;
	AUTEUR: string;
	CATEGORIE: string;
	CITATION: string;
	VISIBLE: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface DailyCitationResponse {
	data: DailyCitationData;
}
