export const getInitials = (input: string): string => {
	if (!input) return "";

	// Split the string into words
	const words = input.trim().split(/\s+/);

	// Extract the first letter of the first two words
	const initials = words
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase());

	// Join the initials and return
	return initials.join("");
};
