const ensureBaseUrl = (): string => {
	const rawUrl = process.env.EXPO_PUBLIC_API_URL;

	if (!rawUrl || rawUrl.trim().length === 0) {
		throw new Error("EXPO_PUBLIC_API_URL is not configured.");
	}

	return rawUrl.replace(/\/+$/u, "");
};

/**
 * Build a request URL for our Strapi API by trimming duplicate slashes.
 * The `path` argument may include query parameters.
 */
export const buildApiUrl = (path = ""): string => {
	const baseUrl = ensureBaseUrl();

	if (!path) {
		return baseUrl;
	}

	const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${baseUrl}${sanitizedPath}`;
};
