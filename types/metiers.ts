export type MetierAttributes = {
	METIER: string;
	ROLE_MISSIONS: string;
	COMPETENCES: string;
	METIERS_SIMILAIRES: string;
	FORMATION: string;
	SALAIRES: string;
	NOTRE_AVIS: string;
	VERBATIM: string;
	BREF: string;
	PORTRAIT_CHINOIS: string;
	CATEGORIE: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
};

export type MetiersList = {
	data: {
		id: number;
		attributes: {
			METIER: string;
		};
	}[];
};

export type MetierPayload = {
	data: {
		id: number;
		attributes: MetierAttributes;
	};
};

export type SelectedMetier = {
	id: number;
	METIER: string;
};
