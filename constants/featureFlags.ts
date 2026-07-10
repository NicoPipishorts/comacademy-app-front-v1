const parsePublicBooleanFlag = (value: string | undefined) => {
	if (!value) {
		return false;
	}

	return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

export const isParcoursEnabled = parsePublicBooleanFlag(
	process.env.EXPO_PUBLIC_ENABLE_PARCOURS,
);
