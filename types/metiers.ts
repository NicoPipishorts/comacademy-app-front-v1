export interface MetierAttributes {
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
}

export interface MetiersList {
	data: {
		id: number;
		attributes: {
			METIER: string;
		};
	}[];
}

export interface MetierPayload {
	data: {
		id: number;
		attributes: MetierAttributes;
	};
}

export interface SelectedMetier {
	id: number;
	METIER: string;
}

export interface FavoriteMetier {
	id: number;
	attributes: MetierAttributes;
}

export interface FavoriteMetiers {
	data: {
		id: number;
		attributes: {
			userId: string;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
			metiers: {
				data: {
					id: number;
					attributes: MetierAttributes;
				}[];
			};
		};
	};
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}
