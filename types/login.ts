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
}

export interface LoginPayload {
	jwt: string;
	user: LoginUser;
}
