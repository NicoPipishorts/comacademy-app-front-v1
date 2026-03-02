import { SESSION_MIGRATION_VERSION, STORAGE_MIGRATION_KEY } from "@/constants";
import { AuthResponse } from "@/types/credentials/auth";
import { normalizeAuthResponse } from "@/helpers/strapi";
import { logDevice } from "@/helpers/logDevice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, {
	createContext,
	Dispatch,
	FunctionComponent,
	ReactNode,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

const AUTH_STORAGE_KEY = "auth";
const TOKEN_STORAGE_KEY = "jwtToken";
const BUILD_STORAGE_KEY = "auth.lastBuild";

const captureStackTrace = (): string | undefined => {
	const stack = new Error().stack;
	if (!stack) return undefined;
	return stack
		.split("\n")
		.slice(2, 6)
		.map((line) => line.trim())
		.join(" | ");
};

type DecodedToken = {
	exp?: number;
};

interface AuthContextType {
	isAuthenticated: boolean;
	session: AuthResponse | null;
	token: string | null;
	loading: boolean;
	login: (data: AuthResponse) => Promise<void>;
	logout: () => Promise<void>;
	checkLoggedIn: () => Promise<boolean>;
	isRegistering: boolean;
	setIsRegistering: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

const resolveBuildIdentifier = (): string => {
	const expoConfig = Constants.expoConfig ?? {};
	const candidateValues: Array<string | number | undefined | null> = [
		Constants.nativeBuildVersion,
		Platform.select({
			ios: expoConfig?.ios?.buildNumber,
			android: expoConfig?.android?.versionCode,
			default: undefined,
		}),
		Constants.nativeApplicationVersion,
	];

	for (const candidate of candidateValues) {
		if (typeof candidate === "string" && candidate.trim().length > 0) {
			return candidate;
		}
		if (typeof candidate === "number" && Number.isFinite(candidate)) {
			return String(candidate);
		}
	}

	const fallbackVersion =
		expoConfig?.extra?.eas?.appVersion &&
		expoConfig.extra.eas.appVersion.trim().length > 0
			? expoConfig.extra.eas.appVersion
			: expoConfig?.version && expoConfig.version.trim().length > 0
			?
				`${expoConfig.version}-unknown`
			: "unknown";

	return fallbackVersion;
};

const describeToken = (token?: string | null) => {
	if (!token) {
		return "none";
	}

	const short =
		token.length > 16
			? `${token.slice(0, 8)}…${token.slice(-8)}`
			: token;

	try {
		const decoded = jwtDecode<DecodedToken>(token);
		if (decoded.exp) {
			return `${short} exp=${new Date(decoded.exp * 1000).toISOString()}`;
		}
	} catch {
		// ignore decoding failures—still report the truncated token
	}

	return short;
};

const setAxiosAuthHeader = (value: string | null) => {
	if (value) {
		axios.defaults.headers.common.Authorization = `Bearer ${value}`;
	} else {
		delete axios.defaults.headers.common.Authorization;
	}
};

const hasAuthorizationHeader = (headers?: HeadersInit | null): boolean => {
	if (!headers) return false;

	if (typeof Headers !== "undefined" && headers instanceof Headers) {
		const value = headers.get("Authorization") ?? headers.get("authorization");
		return Boolean(value && value.trim().length > 0);
	}

	if (Array.isArray(headers)) {
		return headers.some(([key, value]) => {
			if (key.toLowerCase() !== "authorization") return false;
			return typeof value === "string"
				? value.trim().length > 0
				: Boolean(value);
		});
	}

	return Object.entries(headers).some(([key, value]) => {
		if (key.toLowerCase() !== "authorization") return false;
		return typeof value === "string"
			? value.trim().length > 0
			: Boolean(value);
	});
};

const isRequestInstance = (value: unknown): value is Request =>
	typeof Request !== "undefined" && value instanceof Request;

const persistToken = async (token: string) => {
	let storedSecurely = false;
	try {
		if (await SecureStore.isAvailableAsync()) {
			await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
			storedSecurely = true;
		}
	} catch (error) {
		console.error("Failed to store token in SecureStore", error);
	}

	if (!storedSecurely) {
		await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
		logDevice("[AuthContext] persistToken saved via AsyncStorage", {
			token: describeToken(token),
		});
	} else {
		await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
		logDevice("[AuthContext] persistToken saved securely; clearing AsyncStorage record", {
			token: describeToken(token),
		});
	}
};

const readStoredToken = async (): Promise<string | null> => {
	try {
		if (await SecureStore.isAvailableAsync()) {
			const secureToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
			if (secureToken) {
				logDevice("[AuthContext] readStoredToken from SecureStore");
				return secureToken;
			}
		}
	} catch (error) {
		console.error("Failed to read token from SecureStore", error);
	}

	try {
		return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
	} catch (error) {
		console.error("Failed to read token from AsyncStorage", error);
		return null;
	}
};

const removeStoredToken = async () => {
	try {
		if (await SecureStore.isAvailableAsync()) {
			await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
		}
	} catch (error) {
		console.error("Failed to delete token from SecureStore", error);
	}

	try {
		await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
		logDevice("[AuthContext] removeStoredToken cleared AsyncStorage");
	} catch (error) {
		console.error("Failed to remove token from AsyncStorage", error);
	}
};

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
	children,
}) => {
	const buildIdentifier = useMemo(() => resolveBuildIdentifier(), []);
	const shouldTrackBuild = useMemo(
		() => buildIdentifier && buildIdentifier !== "unknown",
		[buildIdentifier]
	);
	const [session, setSession] = useState<AuthResponse | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [isRegistering, setIsRegistering] = useState<boolean>(false);
	const sessionRef = useRef<AuthResponse | null>(null);
	const tokenRef = useRef<string | null>(null);
	const updateSessionState = useCallback(
		(nextSession: AuthResponse | null) => {
			sessionRef.current = nextSession;
			setSession(nextSession);
		},
		[]
	);
	const updateTokenState = useCallback(
		(nextToken: string | null) => {
			tokenRef.current = nextToken;
			setToken(nextToken);
		},
		[]
	);
	const loginPromiseRef = useRef<Promise<void> | null>(null);
	const logoutInFlightRef = useRef<boolean>(false);

	const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const interceptorRef = useRef<number | null>(null);

	const clearExpiryTimer = useCallback(() => {
		if (expiryTimerRef.current) {
			clearTimeout(expiryTimerRef.current);
			expiryTimerRef.current = null;
		}
	}, []);

	const clearPersistedSession = useCallback(
		async (reason?: string) => {
			clearExpiryTimer();
			updateSessionState(null);
			updateTokenState(null);
			setAxiosAuthHeader(null);

			const meta: Record<string, unknown> = {};
			if (reason) meta.reason = reason;
			const stack = captureStackTrace();
			if (stack) meta.stack = stack;

			logDevice(
				"[AuthContext] Clearing persisted session",
				Object.keys(meta).length ? meta : undefined,
				"warn"
			);

			await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
			await AsyncStorage.removeItem(BUILD_STORAGE_KEY);
			await removeStoredToken();
		},
		[clearExpiryTimer, updateSessionState, updateTokenState]
	);

	const scheduleTokenExpiryCheck = useCallback(
		(currentToken: string | null) => {
			clearExpiryTimer();
			if (!currentToken) return;

			try {
				const decoded = jwtDecode<DecodedToken>(currentToken);
				if (!decoded.exp) return;

				const msUntilExpiry = decoded.exp * 1000 - Date.now();
				if (msUntilExpiry <= 0) {
					void clearPersistedSession("token already expired");
					return;
				}

				expiryTimerRef.current = setTimeout(() => {
					void clearPersistedSession("token expiry timer fired");
				}, msUntilExpiry);
				logDevice("[AuthContext] scheduleTokenExpiryCheck", {
					durationMs: msUntilExpiry,
				});
			} catch (error) {
				console.error("Failed to schedule token expiry check", error);
				void clearPersistedSession("schedule token expiry failure");
			}
		},
		[clearExpiryTimer, clearPersistedSession]
	);

	const hydrateFromStorage = useCallback(async () => {
		const [[, storedRawSession]] = await AsyncStorage.multiGet([AUTH_STORAGE_KEY]);
		const storedToken = await readStoredToken();
		const storedBuild = await AsyncStorage.getItem(BUILD_STORAGE_KEY);
		let rawSession = storedRawSession;

		if (!rawSession && sessionRef.current && tokenRef.current) {
			const fallbackPayload = JSON.stringify(sessionRef.current);
			await AsyncStorage.setItem(AUTH_STORAGE_KEY, fallbackPayload);
			rawSession = fallbackPayload;
			logDevice(
				"[AuthContext] hydrateFromStorage restored session from memory",
				{ restoredLength: fallbackPayload.length }
			);
		}

		if (!rawSession || !storedToken) {
			logDevice("[AuthContext] hydrateFromStorage missing data", {
				hasRawSession: Boolean(rawSession),
				hasToken: Boolean(storedToken),
				tokenSnapshot: describeToken(storedToken),
			});
			await clearPersistedSession("missing auth payload");
			return false;
		}

		if (
			shouldTrackBuild &&
			storedBuild &&
			storedBuild !== buildIdentifier
		) {
			logDevice("[AuthContext] hydrateFromStorage build mismatch", {
				storedBuild,
				buildIdentifier,
			});
			await clearPersistedSession("build mismatch");
			return false;
		}

		try {
			const parsedSession = JSON.parse(rawSession) as AuthResponse;
			const normalizedSession = normalizeAuthResponse(parsedSession);
			const decoded = jwtDecode<DecodedToken>(storedToken);
			if (decoded.exp && decoded.exp * 1000 < Date.now()) {
				logDevice("[AuthContext] Stored token already expired");
				await clearPersistedSession("stored token expired");
				return false;
			}

			updateSessionState(normalizedSession);
			updateTokenState(storedToken);
			setAxiosAuthHeader(storedToken);
			scheduleTokenExpiryCheck(storedToken);
			logDevice("[AuthContext] hydrateFromStorage success", {
				userId: normalizedSession.user.id,
				token: describeToken(storedToken),
			});
			if (shouldTrackBuild) {
				if (!storedBuild) {
					await AsyncStorage.setItem(BUILD_STORAGE_KEY, buildIdentifier);
				}
			} else if (storedBuild) {
				await AsyncStorage.removeItem(BUILD_STORAGE_KEY);
			}
			return true;
		} catch (error) {
			console.error("Failed to hydrate auth session", error);
			await clearPersistedSession("hydrate parsing error");
			return false;
		}
	}, [
		buildIdentifier,
		clearPersistedSession,
		scheduleTokenExpiryCheck,
		shouldTrackBuild,
		updateSessionState,
		updateTokenState,
	]);

	const checkLoggedIn = useCallback(async () => {
		if (loginPromiseRef.current) {
			logDevice("[AuthContext] checkLoggedIn awaiting login");
			await loginPromiseRef.current;
		}

		const isValid = await hydrateFromStorage();
		logDevice("[AuthContext] checkLoggedIn result", { isValid });
		return isValid;
	}, [hydrateFromStorage]);

	const login = useCallback(
		async (data: AuthResponse) => {
			logDevice("[AuthContext] login invoked", {
				userId: data.user.id,
				build: buildIdentifier,
			});

			const normalized = normalizeAuthResponse(data);

			const run = async () => {
				await AsyncStorage.setItem(
					AUTH_STORAGE_KEY,
					JSON.stringify(normalized)
				);
				logDevice("[AuthContext] persistSession stored", {
					length: JSON.stringify(normalized).length,
				});

				if (shouldTrackBuild) {
					await AsyncStorage.setItem(BUILD_STORAGE_KEY, buildIdentifier);
				} else {
					await AsyncStorage.removeItem(BUILD_STORAGE_KEY);
				}

			await persistToken(normalized.jwt);
			logDevice("[AuthContext] login persisted token", {
				token: describeToken(normalized.jwt),
			});
			updateSessionState(normalized);
			updateTokenState(normalized.jwt);
				logDevice("[AuthContext] login stored session", {
					userId: normalized.user.id,
					hasToken: Boolean(normalized.jwt),
				});
				setIsRegistering(false);
				setAxiosAuthHeader(normalized.jwt);
				scheduleTokenExpiryCheck(normalized.jwt);
			};

			const promise = run();
			loginPromiseRef.current = promise;
			try {
				await promise;
			} finally {
				if (loginPromiseRef.current === promise) {
					loginPromiseRef.current = null;
				}
			}
		},
		[buildIdentifier, scheduleTokenExpiryCheck, shouldTrackBuild]
	);

	const logout = useCallback(async () => {
		await clearPersistedSession("explicit logout");
		setIsRegistering(false);
	}, [clearPersistedSession]);

	const handleUnauthorizedLogout = useCallback(
		async (reason: string) => {
			if (logoutInFlightRef.current) return;
			logoutInFlightRef.current = true;
			try {
				await clearPersistedSession(reason);
			} finally {
				logoutInFlightRef.current = false;
			}
		},
		[clearPersistedSession]
	);

	useEffect(() => {
		const initializeAuth = async () => {
			const seenVersion = await AsyncStorage.getItem(STORAGE_MIGRATION_KEY);
			if (seenVersion !== SESSION_MIGRATION_VERSION) {
				await clearPersistedSession("migration version bump");
				await AsyncStorage.setItem(
					STORAGE_MIGRATION_KEY,
					SESSION_MIGRATION_VERSION
				);
			}

			await hydrateFromStorage();
			setIsRegistering(false);
			setLoading(false);
		};

		initializeAuth();
	}, [clearPersistedSession, hydrateFromStorage]);

	useEffect(() => {
		const handleAppStateChange = (nextAppState: AppStateStatus) => {
			logDevice("[AuthContext] AppState changed", { nextAppState });
			if (nextAppState === "active") {
				void checkLoggedIn();
			}
		};

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange
		);

		return () => {
			subscription.remove();
		};
	}, [checkLoggedIn]);

	useEffect(() => {
		scheduleTokenExpiryCheck(token);
	}, [token, scheduleTokenExpiryCheck]);

	useEffect(() => {
		// Setup axios response interceptor to handle auth failures.
		const interceptor = axios.interceptors.response.use(
			(response) => response,
			async (error) => {
				const status = error.response?.status;
				const url = error.config?.url || "";

				// Determine if the failing request was sent with an auth header;
				// skip logging out for unauthenticated requests (common during boot)
				const headers = error.config?.headers;
				const hadAuthHeader =
					Boolean(headers?.Authorization || headers?.authorization) ||
					Boolean(headers?.common?.Authorization || headers?.common?.authorization);

				// Important: 403s can happen for domain/business checks (IAP validation,
				// entitlements timing, permissions) while the JWT is still valid.
				// Only force logout on explicit unauthorized responses (401).
				if (hadAuthHeader && status === 401) {
					logDevice(
						`[AuthContext] Received 401 response, logging out...`,
						{
							status,
							url,
							token: describeToken(tokenRef.current),
						},
						"warn"
					);
					await handleUnauthorizedLogout("http 401 response");
				} else if (hadAuthHeader && status === 403) {
					logDevice(
						`[AuthContext] Received 403 response, keeping session`,
						{
							status,
							url,
							token: describeToken(tokenRef.current),
						},
						"warn"
					);
				}

				return Promise.reject(error);
			}
		);

		interceptorRef.current = interceptor;

		// Cleanup: eject the interceptor when component unmounts
		return () => {
			if (interceptorRef.current !== null) {
				axios.interceptors.response.eject(interceptorRef.current);
			}
		};
	}, [handleUnauthorizedLogout]);

	useEffect(() => {
		const originalFetch = globalThis.fetch;
		if (!originalFetch) return;

		const authAwareFetch: typeof fetch = async (input, init) => {
			const requestHeaders =
				isRequestInstance(input) ? input.headers : undefined;
			const inputUrl =
				typeof input === "string"
					? input
					: isRequestInstance(input)
						? input.url
						: String(input);
			const hadAuthHeader =
				hasAuthorizationHeader(requestHeaders) ||
				hasAuthorizationHeader(init?.headers);
			let response: Response;
			try {
				response = await originalFetch(input, init);
			} catch (error) {
				logDevice(
					`[AuthContext] fetch request failed`,
					{
						url: inputUrl,
						hadAuthHeader,
						error: error instanceof Error ? error.message : String(error),
					},
					"warn"
				);
				throw error;
			}

			if (hadAuthHeader && response.status >= 400 && response.status !== 401) {
				logDevice(
					`[AuthContext] fetch received error response`,
					{
						status: response.status,
						url: inputUrl,
					},
					response.status >= 500 ? "error" : "warn"
				);
			}

			if (hadAuthHeader && response.status === 401) {
				logDevice(
					`[AuthContext] fetch received 401 response, logging out...`,
					{
						status: response.status,
						url: inputUrl,
						token: describeToken(tokenRef.current),
					},
					"warn"
				);
				void handleUnauthorizedLogout("http 401 fetch response");
			}
			return response;
		};

		globalThis.fetch = authAwareFetch;
		return () => {
			if (globalThis.fetch === authAwareFetch) {
				globalThis.fetch = originalFetch;
			}
		};
	}, [handleUnauthorizedLogout]);

	const contextValue: AuthContextType = {
		isAuthenticated: !!token,
		session,
		token,
		loading,
		login,
		logout,
		checkLoggedIn,
		isRegistering,
		setIsRegistering,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};

export const UseAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
