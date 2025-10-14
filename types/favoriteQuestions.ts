import { QuestionAttributes } from "./question";

export interface FavoriteQuestionsPayloadFull {
	data: {
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
	};
	meta: Record<string, unknown>;
}

export interface FavoriteQuestionsPayloadShort {
	data: {
		id: number;
		attributes: {
			userId: string;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
			questions: {
				data: {
					id: number;
					attributes: Record<string, unknown>;
				}[];
			};
		};
	};
	meta: Record<string, unknown>;
}
