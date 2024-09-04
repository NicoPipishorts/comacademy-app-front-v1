export interface CitationAttributes {
	AUTEUR: string;
	CATEGORIE: string;
	createdAt: string; // You can also use `Date` if you plan to convert it from a string later
	updatedAt: string; // Same here, `Date` can be used instead of `string` if you plan to convert it
	CITATION: string;
}

export interface CitationData {
	id: number;
	attributes: CitationAttributes;
}

export interface CitationResponse {
	data: CitationData[];
}
