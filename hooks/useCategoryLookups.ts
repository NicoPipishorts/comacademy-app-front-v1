import { buildCategoryLookups } from "@/helpers/category/buildCategoryLookups";
import useCategories from "@/hooks/useCategories";
import { useMemo } from "react";

/**
 * Fetches the categories and memoizes the color/icon lookup tables
 * so they are only rebuilt when the categories payload changes.
 */
export default function useCategoryLookups() {
	const { data: categories } = useCategories();

	const lookups = useMemo(() => buildCategoryLookups(categories), [categories]);

	return { categories, ...lookups };
}
