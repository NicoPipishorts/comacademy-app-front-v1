export type GameSessionAttributes = {
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

export type GameSessionQuestionData = {
	id: number;
	attributes: GameSessionAttributes;
};

export type GameSessionPayload = {
	data: Record<string, GameSessionQuestionData>;
};

export type GameSessionDetail = {
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
};

export type GameSessionQuestionAttributes = {
	gameId: number | string; // Adjusted to match the example payload ("1459" is a string)
	questionId: {
		data: GameSessionQuestionData;
	};
	answer: boolean;
	order?: number;
	categorie: number;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	userId: number | string; // Adjusted to match the example payload ("1" is a string)
};

export type GameSessionQuestion = {
	id: number;
	attributes: GameSessionQuestionAttributes;
};

export type GameSessionQuestions = {
	data: GameSessionQuestion[]; // An array of GameSessionQuestion objects
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
};
