import { useAnalyticsEventTracker } from "@/hooks/Metrics/useAnalyticsEvents";
import { UseAuth } from "@/auth/AuthContext";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

export default function AnalyticsSessionTracker() {
	const { isAuthenticated } = UseAuth();
	const trackEvent = useAnalyticsEventTracker();
	const sessionStartedAtRef = useRef<string | null>(null);
	const lastAppStateRef = useRef<AppStateStatus>(AppState.currentState);

	useEffect(() => {
		if (!isAuthenticated || sessionStartedAtRef.current) {
			return;
		}

		const startedAt = new Date().toISOString();
		sessionStartedAtRef.current = startedAt;
		void trackEvent({
			eventName: "session_started",
			occurredAt: startedAt,
			properties: { source: "app_lifecycle" },
		});
	}, [isAuthenticated, trackEvent]);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (nextState) => {
			const previousState = lastAppStateRef.current;
			lastAppStateRef.current = nextState;

			if (!isAuthenticated) {
				return;
			}

			if (
				previousState.match(/inactive|background/u) &&
				nextState === "active" &&
				!sessionStartedAtRef.current
			) {
				const startedAt = new Date().toISOString();
				sessionStartedAtRef.current = startedAt;
				void trackEvent({
					eventName: "session_started",
					occurredAt: startedAt,
					properties: { source: "app_lifecycle_resume" },
				});
				return;
			}

			if (nextState.match(/inactive|background/u) && sessionStartedAtRef.current) {
				const endedAt = new Date().toISOString();
				const startedAt = sessionStartedAtRef.current;
				sessionStartedAtRef.current = null;
				void trackEvent({
					eventName: "session_ended",
					occurredAt: endedAt,
					properties: {
						source: "app_lifecycle",
						durationMs: new Date(endedAt).getTime() - new Date(startedAt).getTime(),
					},
				});
			}
		});

		return () => {
			subscription.remove();
		};
	}, [isAuthenticated, trackEvent]);

	return null;
}
