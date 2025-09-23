// src/types/userPreferences.ts
export type UserPreferencesResponse = {
	data: {
		id: number;
		attributes: {
			avatarBackgroundColor: string;
			createdAt: string;
			updatedAt: string;
			publishedAt: string | null;
			user: {
				firstName: string;
				lastName: string;
			};
		};
	} | null;
	meta: Record<string, unknown>;
};
