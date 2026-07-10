import { useCallback } from "react";

import { sendAnalyticsEvent } from "@/api/analyticsEvents";
import type { AnalyticsEventPayload } from "@/api/analyticsEvents";
import { UseAuth } from "@/auth/AuthContext";

type TrackAnalyticsEventInput = Omit<
	AnalyticsEventPayload,
	"authToken" | "userId"
> & {
	userId?: AnalyticsEventPayload["userId"];
};

export const useAnalyticsEventTracker = () => {
	const { token, session } = UseAuth();

	return useCallback(
		async (event: TrackAnalyticsEventInput) => {
			await sendAnalyticsEvent({
				...event,
				authToken: token,
				userId: event.userId ?? session?.user?.id ?? null,
			});
		},
		[session?.user?.id, token]
	);
};
