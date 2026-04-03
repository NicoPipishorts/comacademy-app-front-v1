export interface QuestionById {
	data: QuestionSolo;
	meta: Record<string, unknown>;
}

export interface QuestionSolo {
	id: number;
	documentId?: string;
	attributes: QuestionAttributes;
}

export interface QuestionAttributes {
	ACTIVE: boolean;
	ANSWER: boolean;
	CATEGORIE: string;
	COEF: number;
	QUESTION: string;
	REPONSE: string;
	SENSIBILITE: string | null;
	TAG: string;
	createdAt: string;
	updatedAt: string;
}
