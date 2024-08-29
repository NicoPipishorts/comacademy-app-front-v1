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

export type GameSession = {
	data: {
		id: number;
		attributes: {
			userId: number;
			score: number;
			inProgress: boolean;
			abandoned: boolean;
			questionsPool: GameData;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
			finished_at: string;
		};
	};
	meta: Record<string, unknown>;
};

export type GameSessionQuestions = {
	data: {
		id: number;
		attributes: {
			gameId: number;
			questionId: number;
			answer: boolean;
			order: number;
		};
	};
	meta: {
		pagination: {
			total: number;
		};
	};
};
