// src/types/commandement.ts

export interface CommandementCategory {
	Name: string;
	backgroundColor: string;
}

export interface CommandementCategories {
	data: CommandementCategory[];
}

export interface CommandementCard {
	id: number;
	titre: string;
	contenus: string;
	cta: string | null;
	headerCard: string | null;
}

export interface CommandementAttributes {
	Theme: string;
	Active: boolean;
	Categories: CommandementCategories;
	cards: CommandementCard[];
}

export interface CommandementData {
	id: number;
	attributes: CommandementAttributes;
}

export interface SingleCommandementResponse {
	data: CommandementData;
}

export interface MultipleCommandementsResponse {
	data: CommandementData[];
}
