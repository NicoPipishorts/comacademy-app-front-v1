// src/hooks/useGetUserPreferences.ts
import { logDevice } from "@/helpers/logDevice";
import useJwtToken from "@/hooks/useJwtToken";
import {
	UserPreferenceData,
	UserPreferencesResponse,
} from "@/types/userPreferences";
import { useQuery } from "@tanstack/react-query";

const avatarLog = (message: string, payload?: Record<string, unknown>) => {
	const prefixedMessage = `[UserPreferences] ${message}`;
	logDevice(prefixedMessage, payload);

	if (!__DEV__) return;
	if (payload) {
		console.log(prefixedMessage, payload);
		return;
	}
	console.log(prefixedMessage);
};

const fetchUserPreferences = async (
	token: string,
	userId: number
): Promise<UserPreferencesResponse> => {
	const startedAt = Date.now();
	const timer = setTimeout(() => {
		avatarLog("fetch still pending", {
			userId,
			elapsedMs: Date.now() - startedAt,
		});
	}, 10000);

	let res: Response;
	try {
		res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user-preferences/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		avatarLog("fetch response received", {
			userId,
			status: res.status,
			ok: res.ok,
			elapsedMs: Date.now() - startedAt,
		});
	} catch (error) {
		avatarLog("fetch failed before response", {
			userId,
			elapsedMs: Date.now() - startedAt,
			error: error instanceof Error ? error.message : "Unknown error",
		});
		throw error;
	} finally {
		clearTimeout(timer);
	}

	if (res.status === 404) {
		return {
			data: null,
			meta: {},
		};
	}

	if (!res.ok) {
		throw new Error(`Failed to fetch user preferences, status ${res.status}`);
	}

	const json = await res.json();
	const maybeWrapped = json as UserPreferencesResponse;
	if (maybeWrapped && typeof maybeWrapped === "object" && "data" in maybeWrapped) {
		return maybeWrapped;
	}

	return {
		data: json as UserPreferenceData,
		meta: {},
	};
};

export const useGetUserPreferences = (userId: number) => {
	const { token } = useJwtToken();

	return useQuery<UserPreferencesResponse>({
		queryKey: ["UserPreferences", "me", userId],
		queryFn: () => fetchUserPreferences(token, userId),
		enabled: !!token && !!userId,
	});
};

export default useGetUserPreferences;
