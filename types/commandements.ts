export interface CommandementsCategories {
	id: number;
	attributes: {
		Name: string;
		Description: string | null;
		Title: string;
		backgroundColor: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface CommandementsAttributes {
	Theme: string;
	Astuce_1: string;
	Astuce_2: string;
	Astuce_3: string;
	Astuce_4: string;
	Astuce_5: string;
	Astuce_7: string;
	Astuce_8: string;
	Astuce_9: string;
	Astuce_10: string;
	Astuce_11: string;
	Active: boolean;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	Categories: {
		data: CommandementsCategories[];
	};
}

export interface CommandementsData {
	id: number;
	attributes: CommandementsAttributes;
}

export interface CommandementsPayload {
	data: CommandementsData[];
}

export interface CommandementPayload {
	data: CommandementsData;
}
