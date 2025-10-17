type SubscriptionStatus =
	| "active"
	| "expired"
	| "cancelled"
	| "grace_period"
	| "billing_retry"
	| "paused"
	| string;

interface SubscriptionPayload {
	id?: number;
	productId: string | null;
	status: SubscriptionStatus | null;
	expiresAt: string | null;
	autoRenewing: boolean | null;
	platform?: "ios" | "android";
	environment?: "sandbox" | "production";
}

export interface AuthResponse {
	jwt: string;
	user: {
		id: number;
		username: string;
		firstName: string | null;
		lastName: string | null;
		email: string;
		confirmed: boolean;
		blocked: boolean;
		clients: { nom: string }[];
		user_preference: {
			avatarBackgroundColor: string;
		} | null;
		profile: string | null;
		subscription: SubscriptionPayload | null;
		manualPremium: boolean;
		hasPremiumAccess: boolean;
	};
}
