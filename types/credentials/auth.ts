export interface AuthResponse {
	jwt: string;
	user: {
		id: number;
		username: string;
		firstName: string;
		lastName: string;
		email: string;
		confirmed: boolean;
		blocked: boolean;
		clients: { nom: string }[]; // currently empty array, but array of objects with "nom"
		user_preference: {
			avatarBackgroundColor: string;
		} | null;
		profile: string | null; // ProfileType.Key
		subscription: {
			typeKey: string | null; // SubscriptionType.Key
			autoRenew: boolean | null;
			dateSubscribed: string | null; // ISO datetime
		} | null;
	};
}
