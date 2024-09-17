export interface QuestionById {
	data: {
		id: number; // Assuming 'id' is a number
		attributes: QuestionAttributes[];
	};
	meta: Record<string, unknown>; // 'meta' is an empty object, but we'll allow for flexibility
}

export interface QuestionAttributes {
	ACTIVE: boolean;
	ANSWER: boolean;
	CATEGORIE: string; // Assuming 'CATEGORIE' is a string
	COEF: number; // Assuming 'COEF' is a number
	QUESTION: string;
	REPONSE: string;
	SENSIBILITE: string | null; // 'SENSIBILITE' might be nullable
	TAG: string;
	createdAt: string; // ISO date strings are typically represented as strings
	updatedAt: string; // ISO date strings are typically represented as strings
}
