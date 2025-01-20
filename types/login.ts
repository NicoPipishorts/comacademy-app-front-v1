export interface LoginUser {
	id: number;
	username: string;
	email: string;
	provider: string;
	confirmed: boolean;
	blocked: boolean;
	createdAt: string;
	updatedAt: string;
	firstName: string;
	lastName: string;
	profile: string;
	role: {
		id: number;
		name: string;
		description: string;
		type: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface LoginPayload {
	jwt: string;
	user: LoginUser;
}
