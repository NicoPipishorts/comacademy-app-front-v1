// Existing Playlists definitions
// Import external dependencies for PlaylistContent
import { DicoAttributes } from "./dico";
import { MetierAttributes } from "./metiers";
import { QuestionAttributes } from "./question";

export interface PlaylistsResponse {
	data: PlaylistsData[];
}

export interface PlaylistResponse {
	data: PlaylistsData;
}

export interface PlaylistsData {
	id: number;
	attributes: PlaylistsAttributes;
}

export interface PlaylistsAttributes {
	name: string;
	selectedColor: string;
	playlist_contents?: PlaylistContentData[]; // Already defined in this file
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

// Add PlaylistContent definitions
export interface PlaylistContentResponse {
	data: PlaylistContentData;
	meta: Record<string, unknown>;
}

export interface PlaylistContentData {
	id: number;
	attributes: PlaylistContentAttributes;
}

export interface PlaylistContentAttributes {
	name: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	selectedColor: string;
	playlist_contents: PlaylistContentsRelation;
}

export interface PlaylistContentsRelation {
	data: PlaylistContentItem[];
}

export interface PlaylistContentItem {
	id: number;
	attributes: PlaylistContentItemAttributes;
}

export interface PlaylistContentItemAttributes {
	createdAt: string;
	updatedAt: string;
	active: boolean;
	dico: Relation<DicoAttributes> | null;
	metier: Relation<MetierAttributes> | null;
	question: Relation<QuestionAttributes> | null;
}

export interface Relation<T> {
	data: {
		id: number;
		attributes: T;
	} | null;
}
