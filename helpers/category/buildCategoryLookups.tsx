type CatItem = {
	id: number;
	attributes: {
		backgroundColor?: string; // e.g. "C42988" (no #)
		staticId: number;
		smallIcon?: { data?: { attributes?: { url?: string } } };
	};
};

type CategoriesPayload = { data: CatItem[] };

export function buildCategoryLookups(
	payload?: CategoriesPayload,
	apiBase = process.env.EXPO_PUBLIC_API_URL ?? ""
) {
	const colorByStaticId: Record<number, string> = {};
	const iconByStaticId: Record<number, string> = {};

	// Handle undefined or empty payload
	if (!payload || !payload.data) {
		return { colorByStaticId, iconByStaticId };
	}

	for (const cat of payload.data) {
		// Skip if attributes is missing
		if (!cat.attributes) continue;

		const sid = cat.attributes.staticId;

		// color (prefix # if needed)
		const raw = cat.attributes.backgroundColor;
		if (raw) colorByStaticId[sid] = raw.startsWith("#") ? raw : `#${raw}`;

		// icon url (normalize relative → absolute)
		const url = cat.attributes.smallIcon?.data?.attributes?.url;
		if (url)
			iconByStaticId[sid] = url.startsWith("http") ? url : `${apiBase}${url}`;
	}

	return { colorByStaticId, iconByStaticId };
}
