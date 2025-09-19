export interface CategoriePayload {
	data: {
		id: number;
		attributes: CategoriesAttributes;
	}[];
}

export interface CategoriesAttributes {
	Name: string;
	Description: string | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	Title: string;
	backgroundColor: string;
	smallIcon: CategoriesIcon;
	bigIcon: CategoriesIcon;
	staticId: number;
}

export interface CategoriesIcon {
	data: {
		id: number;
		attributes: CategoriesIconAttributes;
	};
}

export interface CategoriesIconAttributes {
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
}

export interface CategoriesFormats {
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
}

export interface CategroiesMenu {
	data: {
		id: number;
		Title: string;
		url: string;
	}[];
}

export interface CategorieColorsAttributes {
	backgroundColor: string;
	smallIcon: CategoriesIcon;
	staticId: number;
}

export interface CategorieColors {
	data: {
		id: number;
		attributes: CategorieColorsAttributes;
	}[];
}
