export interface GameSessionQuestions {
	data: GameSessionQuestion[];
	meta?: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

export interface GameSessionQuestion {
	id: number;
	attributes: GameSessionQuestionAttributes;
}

export interface GameSessionQuestionAttributes {
	gameId: number | string;
	questionId: {
		data: GameSessionQuestionData;
	};
	answer: boolean;
	order?: number;
	categorie: number;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	userId: number | string;
}

export interface GameSessionQuestionData {
	id: number;
	attributes: GameSessionAttributes;
}

export interface GameSessionAttributes {
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
}

export interface GameAttributes {
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
}

export interface GameDataPayload {
	data: Record<string, GameData>;
}

export interface GameData {
	id: number;
	attributes: GameAttributes;
}

export interface GameSessionPayload {
	data: Record<string, GameSessionQuestionData>;
}

export interface GameSessionDetail {
	data: {
		id: number;
		attributes: {
			userId: number;
			score: number;
			inProgress: boolean;
			abandoned: boolean;
			questionsPool: GameSessionPayload;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
			finished_at: string;
		};
	};
	meta: Record<string, unknown>;
}
