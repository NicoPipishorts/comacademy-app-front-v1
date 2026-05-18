import { ParcoursTimelineDay, ParcoursWeekDetail } from "@/types/parcours";

export const getParcoursDayLabel = (dayKey: string) =>
	({
		monday: "Lundi",
		tuesday: "Mardi",
		wednesday: "Mercredi",
		thursday: "Jeudi",
		friday: "Vendredi",
	}[dayKey] || dayKey);

export const countStartedParcoursDays = (days: ParcoursTimelineDay[]) =>
	days.filter((day) => day.status === "completed" || day.status === "in_progress")
		.length;

export const formatParcoursWeekProgressLabel = (week: ParcoursWeekDetail) => {
	const startedCount = countStartedParcoursDays(week.days || []);
	const totalCount = week.totalDaysCount || week.days?.length || 0;
	return `${startedCount} activite${startedCount > 1 ? "s" : ""} sur ${totalCount}`;
};

export const getParcoursWeekProgressRatio = (week: ParcoursWeekDetail) => {
	const totalCount = week.totalDaysCount || week.days?.length || 0;
	if (!totalCount) {
		return 0;
	}

	return countStartedParcoursDays(week.days || []) / totalCount;
};

export const getCurrentReadyParcoursDayId = (days: ParcoursTimelineDay[]) => {
	const readyDays = days.filter((day) => day.status === "ready");
	if (!readyDays.length) {
		return null;
	}

	return readyDays.reduce((latest, day) =>
		day.sortOrder > latest.sortOrder ? day : latest
	).id;
};
