export type DicoPayload = {
	data: DicoDataItem;
};

export type DicoDataItem = {
	id: number;
	attributes: DicoAttributes;
};

export type DicoAttributes = {
	Categories: string;
	Tags: string;
	Word: string;
	Definition: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type DicoSelected = {
	id: number;
	Word: string;
};

export type DicoLists = {
	data: {
		id: number;
		attributes: {
			Word: string;
		};
	}[];
};
