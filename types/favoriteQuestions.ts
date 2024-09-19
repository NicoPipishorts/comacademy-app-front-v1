import { QuestionAttributes } from "./question";

export type FavoriteQuestionsPayloadFull = {
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
};

export type FavoriteQuestionsPayloadShort = {
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
					attributes: {};
				}[];
			};
		};
	};
	meta: Record<string, unknown>;
};
