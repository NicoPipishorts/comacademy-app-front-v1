// Describes the attributes for a single question
export interface QuestionAttributes {
	id: number;
	TAG: string | null;
	COEF: number | null;
	ACTIVE: boolean;
	ANSWER: boolean;
	MainCat: number;
	REPONSE: string | null;
	QUESTION: string | null;
	CATEGORIE: number;
	createdAt: string;
	updatedAt: string;
	SENSIBILITE: string;
}

// Wraps a single question record
export interface QuestionData {
	id: number;
	attributes: QuestionAttributes;
}

// The payload returned by GET /user-game-session-status/:userId
export interface GameQuestionsResponse {
	sessionId: number;
	isNewSession: boolean;
	answeredCount: number;
	questionsLeft: number;
	status: "in_progress" | "finished";
	questionsPool: QuestionData[];
}
