export interface SecretAttributes {
	Brand: string;
	Title: string;
	Key1: string;
	Key2: string;
	Key3: string;
	Active: boolean;
	createdAt: string; // ISO 8601 format date string
	updatedAt: string; // ISO 8601 format date string
	publishedAt: string; // ISO 8601 format date string
}

export interface SecretsData {
	id: number;
	attributes: SecretAttributes;
}

export interface SecretsResponse {
	data: SecretsData[];
}
