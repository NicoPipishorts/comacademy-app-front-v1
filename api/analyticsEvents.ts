import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse, isAxiosError } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const ANALYTICS_ANONYMOUS_ID_KEY = "analytics.anonymousId";

export type AnalyticsEventName =
	| "screen_viewed"
	| "session_started"
	| "session_ended"
	| "login_succeeded"
	| "signup_completed"
	| "rubric_opened"
	| "game_session_started"
	| "purchase_succeeded";

export type AnalyticsEventProperties = Record<string, unknown>;

export interface AnalyticsEventPayload {
	eventName: AnalyticsEventName;
	occurredAt?: string;
	userId?: number | string | null;
	anonymousId?: string | null;
	sessionId?: string | null;
	platform?: "ios" | "android" | "web" | "unknown";
	appVersion?: string | null;
	screenName?: string | null;
	rubricKey?: string | null;
	properties?: AnalyticsEventProperties;
	authToken?: string | null;
}

interface AnalyticsEventResponse {
	message: string;
	data: unknown;
}

let sessionId: string | null = null;

const createId = (prefix: string): string =>
	`${prefix}_${Date.now().toString(36)}_${Math.random()
		.toString(36)
		.slice(2, 10)}`;

export const getAnalyticsSessionId = (): string => {
	if (!sessionId) {
		sessionId = createId("session");
	}

	return sessionId;
};

export const getAnalyticsAnonymousId = async (): Promise<string> => {
	const existingId = await AsyncStorage.getItem(ANALYTICS_ANONYMOUS_ID_KEY);

	if (existingId) {
		return existingId;
	}

	const anonymousId = createId("anon");
	await AsyncStorage.setItem(ANALYTICS_ANONYMOUS_ID_KEY, anonymousId);
	return anonymousId;
};

const resolveAppVersion = (): string =>
	Constants.nativeApplicationVersion ??
	Constants.expoConfig?.version ??
	"unknown";

const resolvePlatform = (): "ios" | "android" | "web" | "unknown" => {
	if (Platform.OS === "ios" || Platform.OS === "android" || Platform.OS === "web") {
		return Platform.OS;
	}

	return "unknown";
};

export const sendAnalyticsEvent = async ({
	authToken,
	...payload
}: AnalyticsEventPayload): Promise<AnalyticsEventResponse | null> => {
	const anonymousId = payload.anonymousId ?? (await getAnalyticsAnonymousId());
	const body = {
		eventName: payload.eventName,
		occurredAt: payload.occurredAt ?? new Date().toISOString(),
		userId: payload.userId ?? null,
		anonymousId,
		sessionId: payload.sessionId ?? getAnalyticsSessionId(),
		platform: payload.platform ?? resolvePlatform(),
		appVersion: payload.appVersion ?? resolveAppVersion(),
		screenName: payload.screenName ?? null,
		rubricKey: payload.rubricKey ?? null,
		properties: payload.properties ?? {},
	};

	try {
		const response: AxiosResponse<AnalyticsEventResponse> = await axios({
			method: "POST",
			url: buildApiUrl("/custom-metrics/events"),
			headers: {
				"Content-Type": "application/json",
				...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
			},
			timeout: 5000,
			data: body,
		});

		return response.data;
	} catch (error) {
		if (isAxiosError(error)) {
			const errorPayload = error.response?.data ?? error.message;
			console.error("Error sending analytics event:", errorPayload);
			return null;
		}

		console.error("Unexpected error sending analytics event:", error);
		return null;
	}
};
