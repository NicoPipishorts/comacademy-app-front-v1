export type Question = {
	id: number;
	attributes: {};
};

export type QuestionsData = {
	data: Question[];
};

export type FavoriteQuestionAttributes = {
	userId: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	questions: QuestionsData;
};

export type FavoriteQuestionData = {
	id: number;
	attributes: FavoriteQuestionAttributes;
};

export type FavoriteQuestionsPayload = {
	data: FavoriteQuestionData;
	meta: Record<string, unknown>;
};
