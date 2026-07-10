import ComingSoonScreen from "@/components/experience/ComingSoonScreen";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import React from "react";

export default function TropheesScreen() {
	useTrackPageMetrics({ page: "Trophees" });

	return (
		<ComingSoonScreen
			title='Mes trophées'
			description='La section trophées est en préparation et arrive très bientôt.'
		/>
	);
}
