export type CategoriePayload = {
	data: Array<{
		id: number;
		attributes: CategoriesAttributes;
	}>;
};

export type CategoriesAttributes = {
	Name: string;
	Description: string | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	Title: string;
	backgroundColor: string;
	smallIcon: CategoriesIcon;
	bigIcon: CategoriesIcon;
};

export type CategoriesIcon = {
	data: {
		id: number;
		attributes: CategoriesIconAttributes;
	};
};

export type CategoriesIconAttributes = {
	name: string;
	alternativeText: string | null;
	caption: string | null;
	width: number;
	height: number;
	formats: CategoriesFormats | null;
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

export type CategoriesFormats = {
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
