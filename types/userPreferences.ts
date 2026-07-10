export type UserPreferenceUser = {
	firstName?: string | null;
	lastName?: string | null;
	[key: string]: unknown;
};

export type UserPreferenceAttributes = {
	avatarBackgroundColor?: string | null;
	avatar?: unknown;
	avatarImage?: unknown;
	avatar_image?: unknown;
	user?: UserPreferenceUser | null;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string | null;
	[key: string]: unknown;
};

export type UserPreferenceData = {
	id?: number;
	attributes?: UserPreferenceAttributes;
	avatarBackgroundColor?: string | null;
	avatar?: unknown;
	avatarImage?: unknown;
	avatar_image?: unknown;
	user?: UserPreferenceUser | null;
	[key: string]: unknown;
};

export type UserPreferencesResponse = {
	data: UserPreferenceData | null;
	meta: Record<string, unknown>;
};
