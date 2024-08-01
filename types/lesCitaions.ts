type LesCitationsPayload = {
	data: LesCitationsDataItem[];
};

type LesCitationsDataItem = {
	id: number;
	attributes: LesCitationsAttributes;
};

type LesCitationsAttributes = {
	AUTEUR: string;
	CATEGORIE: string;
	createdAt: string;
	updatedAt: string;
	CITATION: string;
};
