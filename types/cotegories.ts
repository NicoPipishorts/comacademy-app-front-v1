export type CategoriePayload = {
	data: Array<{
		id: number;
		attributes: Attributes;
	}>;
};

export type Attributes = {
	Name: string;
	Description: string | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	Title: string;
	backgroundColor: string;
	smallIcon: Icon;
	bigIcon: Icon;
};

export type Icon = {
	data: {
		id: number;
		attributes: IconAttributes;
	};
};

export type IconAttributes = {
	name: string;
	alternativeText: string | null;
	caption: string | null;
	width: number;
	height: number;
	formats: Formats | null;
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl: string | null;
	provider: string;
	provider_metadata: any | null;
	createdAt: string;
	updatedAt: string;
};

export type Formats = {
	thumbnail?: {
		ext: string;
		url: string;
		hash: string;
		mime: string;
		name: string;
		path: string | null;
		size: number;
		width: number;
		height: number;
		sizeInBytes: number;
	};
};

export type CategroiesMenu = {
	data: Array<{
		id: number;
		Title: string;
		url: string;
	}>;
};
