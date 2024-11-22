import { useCustomPageMetrics } from "@/api/customePageMetrics";
import { AxiosError } from "axios";
import { useEffect } from "react";

interface UseTrackPageMetricsProps {
	page: string;
	token: string | null;
}

export const useTrackPageMetrics = ({
	page,
	token,
}: UseTrackPageMetricsProps) => {
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

		if (!page) {
			return;
		}

		addPageMetric({ page, authToken: token });
	}, [page, token]);
};
