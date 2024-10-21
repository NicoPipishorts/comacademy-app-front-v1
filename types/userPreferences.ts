export type UserPreferencesPayload = {
	data: {
		id: number;
		attributes: {
			avatarBackgroundColor: string;
			createdAt: string;
			updatedAt: string;
			publishedAt: string;
			user_id: {
				data: {
					id: number;
					attributes: {
						username: string;
						email: string;
						provider: string;
						confirmed: boolean;
						blocked: boolean;
						createdAt: string;
						updatedAt: string;
						firstName: string;
						lastName: string;
					};
				};
			};
		};
	}[];
	meta: Record<string, unknown>;
};
