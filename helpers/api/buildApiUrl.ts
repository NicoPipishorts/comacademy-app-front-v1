import Constants from "expo-constants";
import { Platform } from "react-native";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
const warnedKeys = new Set<string>();

const warnOnce = (key: string, message: string) => {
	if (warnedKeys.has(key)) return;
	warnedKeys.add(key);
	console.warn(message);
};

const stripTrailingSlashes = (value: string): string => value.replace(/\/+$/u, "");

const extractHostFromCandidate = (candidate: unknown): string | null => {
	if (typeof candidate !== "string") return null;

	const trimmed = candidate.trim();
	if (!trimmed) return null;

	try {
		const normalized = trimmed.includes("://") ? trimmed : `http://${trimmed}`;
		const parsed = new URL(normalized);
		return parsed.hostname || null;
	} catch {
		const [host] = trimmed.split(/[/:]/u);
		return host || null;
	}
};

const getDevServerHost = (): string | null => {
	if (Platform.OS === "web") return null;

	const constants = Constants as Constants & {
		manifest2?: {
			extra?: {
				expoClient?: {
					hostUri?: string;
				};
			};
		};
	};

	const hostCandidates: unknown[] = [
		Constants.expoConfig?.hostUri,
		constants.manifest2?.extra?.expoClient?.hostUri,
		Constants.linkingUri,
	];

	for (const candidate of hostCandidates) {
		const host = extractHostFromCandidate(candidate);
		if (host && !LOOPBACK_HOSTS.has(host)) {
			return host;
		}
	}

	return null;
};

const resolveConfiguredUrl = (rawUrl: string | undefined, envName: string): string => {
	if (!rawUrl || rawUrl.trim().length === 0) {
		throw new Error(`${envName} is not configured.`);
	}

	const trimmed = rawUrl.trim();

	try {
		const parsedUrl = new URL(trimmed);

		if (Platform.OS !== "web" && LOOPBACK_HOSTS.has(parsedUrl.hostname)) {
			const devServerHost = getDevServerHost();

			if (devServerHost) {
				parsedUrl.hostname = devServerHost;
				return parsedUrl.toString();
			}

			warnOnce(
				envName,
				`${envName} points to ${parsedUrl.hostname}. Expo native builds cannot reach localhost unless the URL is rewritten to your machine's LAN host.`
			);
		}

		return parsedUrl.toString();
	} catch {
		return trimmed;
	}
};

export const hasApiBaseUrl = (): boolean =>
	typeof process.env.EXPO_PUBLIC_API_URL === "string" &&
	process.env.EXPO_PUBLIC_API_URL.trim().length > 0;

export const getApiBaseUrl = (): string =>
	stripTrailingSlashes(
		resolveConfiguredUrl(process.env.EXPO_PUBLIC_API_URL, "EXPO_PUBLIC_API_URL")
	);

export const getPublicBaseUrl = (): string => {
	const rawBaseUrl =
		process.env.EXPO_PUBLIC_URL ??
		process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/u, "");

	return stripTrailingSlashes(
		resolveConfiguredUrl(rawBaseUrl, "EXPO_PUBLIC_URL")
	);
};

const buildApiPath = (path: string): string => {
	const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${getApiBaseUrl()}${sanitizedPath}`;
};

export const getAuthUrl = (): string => buildApiPath("/auth/local");

export const getRegisterUrl = (): string =>
	resolveConfiguredUrl(
		process.env.EXPO_PUBLIC_REGISTER_URL ?? buildApiPath("/auth/local/register"),
		"EXPO_PUBLIC_REGISTER_URL"
	);

export const getForgotPasswordUrl = (): string =>
	resolveConfiguredUrl(
		process.env.EXPO_PUBLIC_FORGOT_PASSWORD_URL ??
			buildApiPath("/auth/forgot-password"),
		"EXPO_PUBLIC_FORGOT_PASSWORD_URL"
	);

export const getResetPasswordUrl = (): string =>
	resolveConfiguredUrl(
		process.env.EXPO_PUBLIC_RESET_PASSWORD_URL ??
			buildApiPath("/auth/reset-password"),
		"EXPO_PUBLIC_RESET_PASSWORD_URL"
	);

/**
 * Build a request URL for our Strapi API by trimming duplicate slashes.
 * The `path` argument may include query parameters.
 */
export const buildApiUrl = (path = ""): string => {
	const baseUrl = getApiBaseUrl();

	if (!path) {
		return baseUrl;
	}

	const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${baseUrl}${sanitizedPath}`;
};
