export type GameAttributes = {
	QUESTION: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	CATEGORIE: string;
	TAG: string | null;
	ANSWER: boolean;
	REPONSE: string;
	ACTIVE: boolean;
	COEF: string | null;
	SENSIBILITE: string | null;
};

export type GameData = {
	id: number;
	attributes: GameAttributes;
};

export type GameDataPayload = {
	data: Record<string, GameData>;
};
