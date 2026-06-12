import { useCustomPageMetrics } from "@/api/customPageMetrics";
import { hasApiBaseUrl } from "@/helpers/api/buildApiUrl";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useAnalyticsEventTracker } from "./useAnalyticsEvents";
import useJwtToken from "../useJwtToken";

interface UseTrackPageMetricsProps {
	page: string;
}

const RUBRIC_KEYS_BY_PAGE: Record<string, string> = {
	citations: "citations",
	feed: "feed",
	metiers: "metiers",
	dico: "dico",
	secrets: "secrets",
	capsules: "secrets",
	topdesflops: "top-des-flops",
	trentesecondes: "trente-secondes",
	"tips and tactics": "commandements",
};

export const useTrackPageMetrics = ({ page }: UseTrackPageMetricsProps) => {
	const { token } = useJwtToken();
	const trackEvent = useAnalyticsEventTracker();
	const onSuccess = (data: any) => {};

	const onError = (error: AxiosError) => {
		console.error(
			`Failed to update page metrics for "${page}":`,
			error.message
		);
	};

	const { mutate: addPageMetric } = useCustomPageMetrics(onSuccess, onError);

	useEffect(() => {
		if (!token) {
			return;
		}

		if (!page?.trim()) {
			return;
		}

		if (!hasApiBaseUrl()) {
			console.warn("Page metrics API URL is not configured; skipping metric tracking.");
			return;
		}

		addPageMetric({ page: page.trim(), authToken: token });

		const screenName = page.trim();
		void trackEvent({
			eventName: "screen_viewed",
			screenName,
			properties: { legacyPageName: screenName },
		});

		const rubricKey = RUBRIC_KEYS_BY_PAGE[screenName.toLowerCase()];
		if (rubricKey) {
			void trackEvent({
				eventName: "rubric_opened",
				screenName,
				rubricKey,
				properties: { source: "screen_view" },
			});
		}
	}, [addPageMetric, page, token, trackEvent]);
};
