export const PROFILE_OPTIONS = [
	{ label: "Étudiant", value: 5 },
	{ label: "Enseignant", value: 6 },
	{ label: "Professionnel", value: 2 },
	{ label: "Passionné", value: 1 },
] as const;

export type ProfileOptionValue = (typeof PROFILE_OPTIONS)[number]["value"];
