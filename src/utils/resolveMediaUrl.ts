import { getPublicBaseUrl } from "@/helpers/api/buildApiUrl";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const toNormalizedUrl = (raw: string, baseUrl: string): string => {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	if (ABSOLUTE_URL_REGEX.test(trimmed)) return trimmed;
	return `${baseUrl}${trimmed}`;
};

export const resolveMediaUrl = (
	value: unknown,
	fallbackUrl: string,
	baseUrl: string = getPublicBaseUrl()
): string => {
	if (typeof value === "string") {
		const resolved = toNormalizedUrl(value, baseUrl);
		if (resolved) return resolved;
	}

	if (value && typeof value === "object") {
		const maybeUrl = (value as { url?: unknown }).url;
		if (typeof maybeUrl === "string") {
			const resolved = toNormalizedUrl(maybeUrl, baseUrl);
			if (resolved) return resolved;
		}
	}

	return fallbackUrl;
};
