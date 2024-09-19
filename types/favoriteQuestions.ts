import { GameSessionQuestionAttributes } from "./game";

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
					attributes: GameSessionQuestionAttributes;
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
					attributes: {};
				}[];
			};
		};
	};
	meta: Record<string, unknown>;
}
