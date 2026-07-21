import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

type ApiRoute = "primary" | "fallback" | "unavailable";

export interface ApiFailoverSnapshot {
	route: ApiRoute;
	primaryOrigin: string;
	fallbackOrigin: string;
}

const HEALTH_CHECK_TIMEOUT_MS = 5_000;
const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const stripApiPath = (value: string): string =>
	value.trim().replace(/\/api\/?$/u, "").replace(/\/+$/u, "");

const requireOrigin = (value: string | undefined, envName: string): string => {
	if (!value?.trim()) {
		throw new Error(`${envName} is not configured.`);
	}
	return stripApiPath(value);
};

const primaryOrigin = requireOrigin(
	process.env.EXPO_PUBLIC_URL ??
		process.env.EXPO_PUBLIC_API_URL,
	"EXPO_PUBLIC_URL or EXPO_PUBLIC_API_URL",
);
const fallbackOrigin = requireOrigin(
	process.env.EXPO_PUBLIC_FALLBACK_URL,
	"EXPO_PUBLIC_FALLBACK_URL",
);

let snapshot: ApiFailoverSnapshot = {
	route: "primary",
	primaryOrigin,
	fallbackOrigin,
};
let installed = false;
let initializationPromise: Promise<ApiFailoverSnapshot> | null = null;
const listeners = new Set<(next: ApiFailoverSnapshot) => void>();
const nativeFetch = globalThis.fetch.bind(globalThis);

const emit = (route: ApiRoute) => {
	if (snapshot.route === route) return;
	snapshot = { ...snapshot, route };
	listeners.forEach((listener) => listener(snapshot));
};

const isPrimaryUrl = (rawUrl: string): boolean => {
	try {
		return new URL(rawUrl).origin === new URL(primaryOrigin).origin;
	} catch {
		return false;
	}
};

const replaceOrigin = (rawUrl: string, nextOrigin: string): string => {
	if (!isPrimaryUrl(rawUrl)) return rawUrl;

	try {
		const parsed = new URL(rawUrl);
		const replacement = new URL(nextOrigin);
		parsed.protocol = replacement.protocol;
		parsed.host = replacement.host;
		return parsed.toString();
	} catch {
		return rawUrl;
	}
};

const getRequestUrl = (input: RequestInfo | URL): string | null => {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	return typeof input.url === "string" ? input.url : null;
};

const rewriteFetchInput = (
	input: RequestInfo | URL,
	nextOrigin: string,
): RequestInfo | URL => {
	const rawUrl = getRequestUrl(input);
	if (!rawUrl) return input;

	const rewrittenUrl = replaceOrigin(rawUrl, nextOrigin);
	if (rewrittenUrl === rawUrl) return input;
	if (typeof input === "string") return rewrittenUrl;
	if (input instanceof URL) return new URL(rewrittenUrl);
	return new Request(rewrittenUrl, input as never);
};

const isIdempotent = (method?: string): boolean =>
	IDEMPOTENT_METHODS.has((method ?? "GET").toUpperCase());

const getRequestMethod = (
	input: RequestInfo | URL,
	init?: RequestInit,
): string | undefined => {
	if (init?.method) return init.method;
	if (typeof input === "string" || input instanceof URL) return undefined;
	return input.method;
};

const isUnmatchedHostResponse = (response: Response): boolean => {
	const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
	return response.status === 404 && contentType.includes("text/html");
};

const isAxiosUnmatchedHostResponse = (error: AxiosError): boolean => {
	const contentType = String(error.response?.headers?.["content-type"] ?? "").toLowerCase();
	return error.response?.status === 404 && contentType.includes("text/html");
};

const checkOrigin = async (origin: string): Promise<boolean> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

	try {
		const response = await nativeFetch(`${origin}/admin`, {
			method: "HEAD",
			signal: controller.signal,
			cache: "no-store",
		});
		return response.ok;
	} catch {
		return false;
	} finally {
		clearTimeout(timeout);
	}
};

const activateFallbackIfAvailable = async (): Promise<boolean> => {
	if (snapshot.route === "fallback") return true;

	const fallbackIsAvailable = await checkOrigin(fallbackOrigin);
	if (fallbackIsAvailable) {
		emit("fallback");
		return true;
	}

	emit("unavailable");
	return false;
};

const installFetchFailover = () => {
	globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const rawUrl = getRequestUrl(input);
		const requestMethod = getRequestMethod(input, init);
		if (!rawUrl || !isPrimaryUrl(rawUrl)) {
			return nativeFetch(input, init);
		}

		const selectedInput =
			snapshot.route === "fallback"
				? rewriteFetchInput(input, fallbackOrigin)
				: input;

		try {
			const response = await nativeFetch(selectedInput, init);
			if (snapshot.route === "fallback") return response;

			const canRetry =
				isUnmatchedHostResponse(response) ||
				(response.status >= 500 && isIdempotent(requestMethod));
			if (!canRetry || !(await activateFallbackIfAvailable())) return response;

			return nativeFetch(rewriteFetchInput(input, fallbackOrigin), init);
		} catch (error) {
			const fallbackActivated =
				snapshot.route === "fallback"
					? true
					: await activateFallbackIfAvailable();
			if (fallbackActivated && isIdempotent(requestMethod)) {
				return nativeFetch(rewriteFetchInput(input, fallbackOrigin), init);
			}
			throw error;
		}
	};
};

type RetryableAxiosConfig = InternalAxiosRequestConfig & {
	_apiFailoverRetried?: boolean;
};

const installAxiosFailover = () => {
	axios.interceptors.request.use((config) => {
		if (
			snapshot.route === "fallback" &&
			typeof config.url === "string" &&
			isPrimaryUrl(config.url)
		) {
			config.url = replaceOrigin(config.url, fallbackOrigin);
		}
		return config;
	});

	axios.interceptors.response.use(undefined, async (error: AxiosError) => {
		const config = error.config as RetryableAxiosConfig | undefined;
		if (
			!config ||
			config._apiFailoverRetried ||
			typeof config.url !== "string" ||
			!isPrimaryUrl(config.url) ||
			snapshot.route === "fallback"
		) {
			throw error;
		}

		const canRetryRequest =
			isAxiosUnmatchedHostResponse(error) ||
			(!error.response && isIdempotent(config.method)) ||
			((error.response?.status ?? 0) >= 500 && isIdempotent(config.method));

		const shouldProbeFallback =
			isAxiosUnmatchedHostResponse(error) ||
			!error.response ||
			(error.response?.status ?? 0) >= 500;
		if (!shouldProbeFallback || !(await activateFallbackIfAvailable())) throw error;
		if (!canRetryRequest) throw error;

		config._apiFailoverRetried = true;
		config.url = replaceOrigin(config.url, fallbackOrigin);
		return axios(config);
	});
};

export const installApiFailover = () => {
	if (installed) return;
	installed = true;
	installFetchFailover();
	installAxiosFailover();
};

export const initializeApiFailover = (): Promise<ApiFailoverSnapshot> => {
	if (initializationPromise) return initializationPromise;

	installApiFailover();
	initializationPromise = (async () => {
		const [primaryIsAvailable, fallbackIsAvailable] = await Promise.all([
			checkOrigin(primaryOrigin),
			checkOrigin(fallbackOrigin),
		]);

		if (primaryIsAvailable) {
			emit("primary");
			return snapshot;
		}

		emit(fallbackIsAvailable ? "fallback" : "unavailable");
		return snapshot;
	})();

	return initializationPromise;
};

export const refreshApiAvailability = async (): Promise<ApiFailoverSnapshot> => {
	const primaryIsAvailable = await checkOrigin(primaryOrigin);
	if (primaryIsAvailable) {
		emit("primary");
		return snapshot;
	}

	await activateFallbackIfAvailable();
	return snapshot;
};

export const getApiFailoverSnapshot = (): ApiFailoverSnapshot => snapshot;

export const subscribeToApiFailover = (
	listener: (next: ApiFailoverSnapshot) => void,
): (() => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};
