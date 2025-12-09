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

const setAxiosAuthHeader = (value: string | null) => {
	if (value) {
		axios.defaults.headers.common.Authorization = `Bearer ${value}`;
	} else {
		delete axios.defaults.headers.common.Authorization;
	}
};

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
		logDevice("[AuthContext] persistToken saved via AsyncStorage");
	} else {
		await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
		logDevice("[AuthContext] persistToken saved securely; clearing AsyncStorage record");
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
	const loginPromiseRef = useRef<Promise<void> | null>(null);

	const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const interceptorRef = useRef<number | null>(null);

	const clearExpiryTimer = useCallback(() => {
		if (expiryTimerRef.current) {
			clearTimeout(expiryTimerRef.current);
			expiryTimerRef.current = null;
		}
	}, []);

const clearPersistedSession = useCallback(async () => {
	clearExpiryTimer();
	setSession(null);
	setToken(null);
	setAxiosAuthHeader(null);
	logDevice("[AuthContext] Clearing persisted session");
	await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
	await AsyncStorage.removeItem(BUILD_STORAGE_KEY);
	await removeStoredToken();
}, [clearExpiryTimer]);

	const scheduleTokenExpiryCheck = useCallback(
		(currentToken: string | null) => {
			clearExpiryTimer();
			if (!currentToken) return;

			try {
				const decoded = jwtDecode<DecodedToken>(currentToken);
				if (!decoded.exp) return;

				const msUntilExpiry = decoded.exp * 1000 - Date.now();
				if (msUntilExpiry <= 0) {
					void clearPersistedSession();
					return;
				}

				expiryTimerRef.current = setTimeout(() => {
					void clearPersistedSession();
				}, msUntilExpiry);
				logDevice("[AuthContext] scheduleTokenExpiryCheck", {
					durationMs: msUntilExpiry,
				});
			} catch (error) {
				console.error("Failed to schedule token expiry check", error);
				void clearPersistedSession();
			}
		},
		[clearExpiryTimer, clearPersistedSession]
	);

	const hydrateFromStorage = useCallback(async () => {
		const [[, rawSession]] = await AsyncStorage.multiGet([AUTH_STORAGE_KEY]);
		const storedToken = await readStoredToken();
		const storedBuild = await AsyncStorage.getItem(BUILD_STORAGE_KEY);

		if (!rawSession || !storedToken) {
			logDevice("[AuthContext] hydrateFromStorage missing data", {
				hasRawSession: Boolean(rawSession),
				hasToken: Boolean(storedToken),
			});
			await clearPersistedSession();
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
			await clearPersistedSession();
			return false;
		}

		try {
			const parsedSession = JSON.parse(rawSession) as AuthResponse;
			const normalizedSession = normalizeAuthResponse(parsedSession);
			const decoded = jwtDecode<DecodedToken>(storedToken);
				if (decoded.exp && decoded.exp * 1000 < Date.now()) {
					logDevice("[AuthContext] Stored token already expired");
				await clearPersistedSession();
				return false;
			}

			setSession(normalizedSession);
			setToken(storedToken);
			setAxiosAuthHeader(storedToken);
			scheduleTokenExpiryCheck(storedToken);
			logDevice("[AuthContext] hydrateFromStorage success", {
				userId: normalizedSession.user.id,
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
			await clearPersistedSession();
			return false;
		}
	}, [
		buildIdentifier,
		clearPersistedSession,
		scheduleTokenExpiryCheck,
		shouldTrackBuild,
	]);

	const checkLoggedIn = useCallback(async () => {
		if (loginPromiseRef.current) {
			logDevice("[AuthContext] checkLoggedIn awaiting login");
			await loginPromiseRef.current;
		}

		const isValid = await hydrateFromStorage();
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
				setSession(normalized);
				setToken(normalized.jwt);
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
		await clearPersistedSession();
		setIsRegistering(false);
	}, [clearPersistedSession]);

	useEffect(() => {
		const initializeAuth = async () => {
			const seenVersion = await AsyncStorage.getItem(STORAGE_MIGRATION_KEY);
			if (seenVersion !== SESSION_MIGRATION_VERSION) {
				await clearPersistedSession();
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
		// Setup axios response interceptor to handle 401/403 errors
		const interceptor = axios.interceptors.response.use(
			(response) => response,
			async (error) => {
				const status = error.response?.status;

				// Determine if the failing request was sent with an auth header;
				// skip logging out for unauthenticated requests (common during boot)
				const headers = error.config?.headers;
				const hadAuthHeader =
					Boolean(headers?.Authorization || headers?.authorization) ||
					Boolean(headers?.common?.Authorization || headers?.common?.authorization);

				if (hadAuthHeader && (status === 401 || status === 403)) {
					console.log(`[AuthContext] Received ${status}, logging out...`);
					await clearPersistedSession();
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
	}, [clearPersistedSession]);

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
