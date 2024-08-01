type CategoryNumber = 1 | 2 | 3 | 4 | 5 | 6;
type CategoryArray = CategoryNumber[];

export type GameAttributes = {
	QUESTION: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	CATEGORIE: CategoryArray;
	TAG: string | null;
	ANSWER: boolean;
	REPONSE: string;
	ACTIVE: boolean;
	COEF: string | null;
	SENSIBILITE: string | null;
	favorite_questions: [];
};

export type GameDataPayload = {
	data: Record<string, GameData>;
};

export type GameData = {
	id: number;
	attributes: GameAttributes;
};
