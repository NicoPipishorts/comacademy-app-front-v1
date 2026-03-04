const SUPPORTED_RESET_PATHS = new Set([
	"auth/reset-password",
	"reset-password",
	"password-reset",
]);

const RESET_CODE_KEYS = ["code", "token", "reset_code"] as const;

export type ResetPasswordDeepLinkPayload = {
	code: string;
	email: string | null;
	path: string;
};

type UrlEvent = { url: string };
type UrlSubscription = { remove: () => void };

export type ProcessInitialDeepLinkArgs = {
	getInitialUrl: () => Promise<string | null>;
	onUrl: (url: string | null) => void;
	onError?: (error: unknown) => void;
};

export type SubscribeToDeepLinksArgs = {
	addUrlListener: (handler: (event: UrlEvent) => void) => UrlSubscription;
	onUrl: (url: string) => void;
};

const normalizePathPart = (value: string | null | undefined): string =>
	(value ?? "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");

const getNormalizedPath = (url: URL): string => {
	const normalizedHost = normalizePathPart(url.hostname);
	const normalizedPathname = normalizePathPart(url.pathname);
	const isWebUrl = url.protocol === "http:" || url.protocol === "https:";

	if (isWebUrl) {
		return normalizedPathname;
	}

	if (normalizedHost && normalizedPathname) {
		return `${normalizedHost}/${normalizedPathname}`;
	}

	return normalizedPathname || normalizedHost;
};

const getFirstNonEmptyQueryParam = (
	searchParams: URLSearchParams,
	keys: readonly string[]
): string | null => {
	for (const key of keys) {
		const value = searchParams.get(key)?.trim();
		if (value) return value;
	}
	return null;
};

export const parseResetPasswordDeepLink = (
	rawUrl: string | null | undefined
): ResetPasswordDeepLinkPayload | null => {
	if (!rawUrl) return null;

	let url: URL;
	try {
		url = new URL(rawUrl);
	} catch {
		return null;
	}

	const normalizedPath = getNormalizedPath(url);
	if (!SUPPORTED_RESET_PATHS.has(normalizedPath)) {
		return null;
	}

	const code = getFirstNonEmptyQueryParam(url.searchParams, RESET_CODE_KEYS);
	if (!code) {
		return null;
	}

	const email = url.searchParams.get("email")?.trim() || null;

	return {
		code,
		email,
		path: normalizedPath,
	};
};

export const processInitialDeepLink = async ({
	getInitialUrl,
	onUrl,
	onError,
}: ProcessInitialDeepLinkArgs): Promise<void> => {
	try {
		const initialUrl = await getInitialUrl();
		onUrl(initialUrl);
	} catch (error) {
		onError?.(error);
	}
};

export const subscribeToDeepLinks = ({
	addUrlListener,
	onUrl,
}: SubscribeToDeepLinksArgs): UrlSubscription =>
	addUrlListener(({ url }) => {
		onUrl(url);
	});
