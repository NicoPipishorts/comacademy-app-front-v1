// Playlist Lists by UserId

import { DicoPayload } from "./dico";
import { MetierPayload } from "./metiers";
import { QuestionById } from "./question";

export interface PlaylistListResponse {
	data: {
		id: number;
		attributes: {
			name: string;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
			selectedColor: string;
			inPlaylist?: boolean;
		};
	}[];
}

// Playlist Contents Definition, not grouped
export interface PlaylistContentResponse {
	data: {
		id: number;
		attributes: {
			name: string;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
			selectedColor: string;
			playlist_contents: {
				data: {
					id: number;
					attributes: {
						createdAt: string;
						updatedAt: string;
						active: boolean;
						dico: DicoPayload | { data: null };
						metier: MetierPayload | { data: null };
						question: QuestionById | { data: null };
					};
				}[];
			};
		};
	};
}

// Playlist Content definition Groupped

export interface PlaylistContentGrouped {
	data: {
		id: number;
		attributes: {
			name: string;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
			selectedColor: string;
			playlist_contents: {
				id: number;
				itemId: number;
				value: string;
				group: "dico" | "métier" | "question";
			}[];
		};
	};
}
