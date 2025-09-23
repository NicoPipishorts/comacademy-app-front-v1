// utils/categoryUtils.ts

/**
 * Retrieve the background color for a category by staticId
 */
export function getCategoryBackgroundColor(
	categories: any[],
	staticId: number,
	fallback: string = "#fff"
): string {
	if (!Array.isArray(categories)) return fallback;

	const match = categories.find(
		(category) => category?.attributes?.staticId === staticId
	);

	const hex = match?.attributes?.backgroundColor;
	if (!hex) return fallback;

	return hex.startsWith("#") ? hex : `#${hex}`;
}

/**
 * Retrieve the small icon URL for a category by staticId
 */
export function getCategorySmallIcon(
	categories: any[],
	staticId: number
): string {
	if (!Array.isArray(categories)) return "";

	const match = categories.find(
		(category) => category?.attributes?.staticId === staticId
	);

	return match?.attributes?.smallIcon?.data?.attributes?.url ?? "";
}
