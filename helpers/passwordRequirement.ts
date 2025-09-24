export type PasswordReqs = {
	length: boolean;
	uppercase: boolean;
	lowercase: boolean;
	number: boolean;
	special: boolean;
};

export function getPasswordRequirements(
	password: string | undefined
): PasswordReqs {
	const p = password ?? "";
	return {
		length: p.length >= 8,
		uppercase: /[A-Z]/.test(p),
		lowercase: /[a-z]/.test(p),
		number: /[0-9]/.test(p),
		special: /[@$!%*?&]/.test(p),
	};
}
