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

		if (!page) {
			return;
		}

		addPageMetric({ page, authToken: token });
	}, [addPageMetric, page, token]);
};
