export interface DicoPayload {
	data: DicoDataItem;
}

export interface DicoDataItem {
	id: number;
	attributes: DicoAttributes;
}

export interface DicoAttributes {
	Categories: string;
	Tags: string;
	Word: string;
	Definition: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface DicoSelected {
	id: number;
	Word: string;
}

export interface DicoLists {
	data: {
		id: number;
		attributes: {
			Word: string;
		};
	}[];
}
