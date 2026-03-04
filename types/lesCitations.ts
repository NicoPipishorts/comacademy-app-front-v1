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

export type CitationsResults = { data: CitationData[] } | CitationData[];

export interface CitationsResponse {
	data: {
		cat: string;
		results: CitationsResults;
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
