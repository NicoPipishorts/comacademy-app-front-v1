import ComingSoonScreen from "@/components/experience/ComingSoonScreen";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import React from "react";

export default function ParcoursComingSoonScreen() {
	useTrackPageMetrics({ page: "Parcours coming soon" });

	return (
		<ComingSoonScreen
			title='Parcours'
			description='Le parcours est en préparation et arrive très bientôt.'
			showAvatar={false}
		/>
	);
}
