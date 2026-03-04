import { QuestionAttributes } from "./question";

export interface FavoriteQuestionsItem {
	id: number;
	attributes: {
		userId: string;
		createdAt: string;
		updatedAt: string;
		publishedAt: string;
		questions: {
			data: {
				id: number;
				attributes: QuestionAttributes;
			}[];
		};
	};
}

export interface FavoriteQuestionsPayloadFull {
	data: FavoriteQuestionsItem[];
	meta: Record<string, unknown>;
}

export interface FavoriteQuestionsPayloadShort {
	data: FavoriteQuestionsItem[];
	meta: Record<string, unknown>;
}
