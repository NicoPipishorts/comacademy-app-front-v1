export interface SecretAttributes {
	Brand: string;
	Title: string;
	Key1: string;
	Key2: string;
	Key3: string;
	Active: boolean;
	headerImage: HeaderImage;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}
export interface HeaderImageFormat {
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
}

export interface HeaderImageAttributes {
	name: string;
	alternativeText: string | null;
	caption: string | null;
	width: number;
	height: number;
	formats: {
		large: HeaderImageFormat;
		small: HeaderImageFormat;
		medium: HeaderImageFormat;
		thumbnail: HeaderImageFormat;
	};
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

export interface HeaderImage {
	data: {
		id: number;
		attributes: HeaderImageAttributes;
	};
}
export interface SecretsData {
	id: number;
	attributes: SecretAttributes;
}

export interface SecretsResponse {
	data: SecretsData[];
}

export interface SecretResponse {
	data: SecretsData;
}
