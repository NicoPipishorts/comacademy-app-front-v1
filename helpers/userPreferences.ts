import {
	UserPreferenceAttributes,
	UserPreferencesResponse,
} from "@/types/userPreferences";

const asRecord = (value: unknown): Record<string, unknown> | null => {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}
	return value as Record<string, unknown>;
};

const getString = (value: unknown): string | null => {
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	return normalized.length ? normalized : null;
};

export const resolveUserPreference = (
	response?: UserPreferencesResponse | null
): (UserPreferenceAttributes & { id?: number }) | null => {
	const entity = response?.data;
	if (!entity) return null;

	const attributes = asRecord(entity.attributes);
	if (attributes) {
		return {
			id: typeof entity.id === "number" ? entity.id : undefined,
			...(attributes as UserPreferenceAttributes),
		};
	}

	const flat = asRecord(entity);
	if (!flat) return null;

	return flat as UserPreferenceAttributes & { id?: number };
};

const resolveApiOrigin = (apiUrl?: string): string => {
	if (!apiUrl) return "";
	return apiUrl.replace(/\/api\/?$/, "");
};

const toAbsoluteMediaUrl = (url: string | null, apiUrl?: string): string | null => {
	if (!url) return null;
	if (/^https?:\/\//i.test(url)) return url;
	const origin = resolveApiOrigin(apiUrl);
	if (!origin) return url;
	return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const resolveUserPreferenceAvatarUrl = (
	preference: (UserPreferenceAttributes & { id?: number }) | null,
	apiUrl = process.env.EXPO_PUBLIC_API_URL
): string | null => {
	if (!preference) return null;

	const avatar = asRecord(preference.avatar);
	const avatarData = asRecord(avatar?.data);
	const avatarAttributes = asRecord(avatarData?.attributes);
	const formats = asRecord(avatarAttributes?.formats ?? avatar?.formats);
	const thumbnail = asRecord(formats?.thumbnail);

	const candidateUrl =
		getString(avatarAttributes?.url) ??
		getString(avatarData?.url) ??
		getString(avatar?.url) ??
		getString(thumbnail?.url) ??
		null;

	return toAbsoluteMediaUrl(candidateUrl, apiUrl);
};

export const resolveUserPreferenceId = (
	preference: (UserPreferenceAttributes & { id?: number }) | null
): number | null => {
	if (!preference) return null;
	const fromId = preference.id;
	if (typeof fromId === "number" && Number.isFinite(fromId)) {
		return fromId;
	}
	return null;
};
