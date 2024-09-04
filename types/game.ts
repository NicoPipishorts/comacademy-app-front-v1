export type GameAttributes = {
	QUESTION: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	CATEGORIE: number;
	TAG: string | null;
	ANSWER: boolean;
	REPONSE: string;
	ACTIVE: boolean;
	COEF: number;
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

export type GameSessionQuestion = {
	id: number;
	attributes: {
		gameId: number;
		questionId: number;
		answer: boolean;
		order: number;
		categorie: number; // Assuming this is part of attributes
	};
};

export type GameSessionQuestions = {
	data: GameSessionQuestion[]; // Updated to an array of GameSessionQuestion objects
	meta: {
		pagination: {
			total: number;
		};
	};
};
