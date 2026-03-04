// utils/categoryUtils.ts

import { resolveEntityAttributes } from "@/helpers/strapi";
import { CategorieColorsAttributes, CategoriesIconAttributes } from "@/types/categories";

const getAttributes = (category: unknown) =>
	resolveEntityAttributes<CategorieColorsAttributes>(category) ??
	(category as { attributes?: CategorieColorsAttributes })?.attributes;

const getStaticId = (attrs?: CategorieColorsAttributes): number | undefined => {
	if (!attrs) return undefined;
	return attrs.staticId ?? (attrs as any).static_id;
};

const getSafeColor = (value?: string, fallback: string): string => {
	const candidate = value?.trim() ?? "";
	const sanitized = candidate.startsWith("#") ? candidate : `#${candidate}`;
	const normalized = sanitized.replace("##", "#");
	if (!/^#[0-9A-Fa-f]{3,6}$/.test(normalized)) return fallback;
	return normalized;
};

const getIconUrl = (
	icon?: { data?: { attributes?: CategoriesIconAttributes } }
): string => {
	return icon?.data?.attributes?.url ?? "";
};

/**
 * Retrieve the background color for a category by staticId
 */
export function getCategoryBackgroundColor(
	rawCategories: unknown,
	staticId: number,
	fallback: string = "#fff"
): string {
	const categories: unknown[] = Array.isArray(rawCategories)
		? rawCategories
		: Array.isArray((rawCategories as { data?: unknown[] })?.data)
		? (rawCategories as { data: unknown[] }).data
		: [];

	for (const category of categories) {
		const attrs = getAttributes(category);
		if (getStaticId(attrs) !== staticId) {
			continue;
		}

		const color =
			attrs?.backgroundColor ??
			(attrs as any)?.background_color ??
			"";

		return getSafeColor(color, fallback);
	}

	return fallback;
}

/**
 * Retrieve the small icon URL for a category by staticId
 */
export function getCategorySmallIcon(
	rawCategories: unknown,
	staticId: number
): string {
	const categories: unknown[] = Array.isArray(rawCategories)
		? rawCategories
		: Array.isArray((rawCategories as { data?: unknown[] })?.data)
		? (rawCategories as { data: unknown[] }).data
		: [];

	for (const category of categories) {
		const attrs = getAttributes(category);
		if (getStaticId(attrs) !== staticId) {
			continue;
		}

		return getIconUrl(attrs?.smallIcon ?? (attrs as any)?.small_icon);
	}

	return "";
}
