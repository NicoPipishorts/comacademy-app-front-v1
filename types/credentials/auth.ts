type SubscriptionStatus =
	| "active"
	| "expired"
	| "cancelled"
	| "grace_period"
	| "billing_retry"
	| "paused"
	| string;

export interface SubscriptionPayload {
	id?: number;
	productId: string | null;
	status: SubscriptionStatus | null;
	expiresAt: string | null;
	autoRenewing: boolean | null;
	platform?: "ios" | "android";
	environment?: "sandbox" | "production";
}

export interface ClientInfo {
	id?: number;
	name?: string | null;
	nom?: string | null;
}

export interface UserPreference {
	avatarBackgroundColor: string;
}

export interface AuthUser {
	id: number;
	username: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	confirmed: boolean;
	blocked: boolean;
	createdAt: string | null;
	clients: ClientInfo[];
	user_preference: UserPreference | null;
	profile: string | null;
	subscription: SubscriptionPayload | null;
	manualPremium: boolean;
	hasPremiumAccess: boolean;
}

export interface AuthResponse {
	jwt: string;
	user: AuthUser;
}
