import { useCustomPageMetrics } from "@/api/customPageMetrics";
import { AxiosError } from "axios";
import { useEffect } from "react";
import useJwtToken from "../useJwtToken";

interface UseTrackPageMetricsProps {
	page: string;
}

export const useTrackPageMetrics = ({ page }: UseTrackPageMetricsProps) => {
	const { token } = useJwtToken();
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

		if (!process.env.EXPO_PUBLIC_API_URL) {
			console.warn("Page metrics API URL is not configured; skipping metric tracking.");
			return;
		}

		addPageMetric({ page: page.trim(), authToken: token });
	}, [addPageMetric, page, token]);
};
