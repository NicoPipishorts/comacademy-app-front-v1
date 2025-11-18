import { SESSION_MIGRATION_VERSION, STORAGE_MIGRATION_KEY } from "@/constants";
import { AuthResponse } from "@/types/credentials/auth";
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
		expoConfig?.version && expoConfig.version.trim().length > 0
			? expoConfig.version
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
	} else {
		await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
	}
};

const readStoredToken = async (): Promise<string | null> => {
	try {
		if (await SecureStore.isAvailableAsync()) {
			const secureToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
			if (secureToken) {
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
	} catch (error) {
		console.error("Failed to remove token from AsyncStorage", error);
	}
};

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
	children,
}) => {
	const buildIdentifier = useMemo(() => resolveBuildIdentifier(), []);
	const [session, setSession] = useState<AuthResponse | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [isRegistering, setIsRegistering] = useState<boolean>(false);

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
			await clearPersistedSession();
			return false;
		}

		if (storedBuild && storedBuild !== buildIdentifier) {
			await clearPersistedSession();
			return false;
		}

		try {
			const parsedSession = JSON.parse(rawSession) as AuthResponse;
			const decoded = jwtDecode<DecodedToken>(storedToken);
			if (decoded.exp && decoded.exp * 1000 < Date.now()) {
				await clearPersistedSession();
				return false;
			}

			setSession(parsedSession);
			setToken(storedToken);
			setAxiosAuthHeader(storedToken);
			scheduleTokenExpiryCheck(storedToken);
			if (!storedBuild) {
				await AsyncStorage.setItem(BUILD_STORAGE_KEY, buildIdentifier);
			}
			return true;
		} catch (error) {
			console.error("Failed to hydrate auth session", error);
			await clearPersistedSession();
			return false;
		}
	}, [buildIdentifier, clearPersistedSession, scheduleTokenExpiryCheck]);

	const checkLoggedIn = useCallback(async () => {
		const isValid = await hydrateFromStorage();
		return isValid;
	}, [hydrateFromStorage]);

	const login = useCallback(
		async (data: AuthResponse) => {
			await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
			await AsyncStorage.setItem(BUILD_STORAGE_KEY, buildIdentifier);
			await persistToken(data.jwt);
			setSession(data);
			setToken(data.jwt);
			setIsRegistering(false);
			setAxiosAuthHeader(data.jwt);
			scheduleTokenExpiryCheck(data.jwt);
		},
		[buildIdentifier, scheduleTokenExpiryCheck]
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
				// Check if it's an auth error (401 Unauthorized or 403 Forbidden)
				if (error.response?.status === 401 || error.response?.status === 403) {
					console.log(
						`[AuthContext] Received ${error.response.status}, logging out...`
					);
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
