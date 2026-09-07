import { ParcoursDayVisualState } from "@/components/parcours/ParcoursDayStatusBadge";
import {
	ParcoursFreemiumMeta,
	ParcoursTimelineDay,
	ParcoursTimelineWeek,
	ParcoursWeekDetail,
} from "@/types/parcours";

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

export const isParcoursWeekOpen = (week: Pick<ParcoursWeekDetail, "days">) =>
	(week.days || []).some((day) => !day.isLocked);

/**
 * Which badge an `expired` day gets. The Sunday 23:59 cut-off freezes started
 * and untouched days alike, but the server keeps a started day reachable so its
 * played steps can be reviewed, while a day never opened stays locked. That
 * `isAccessible` flag is the only reliable signal: a day abandoned on its very
 * first step still reports `currentStepIndex: 0`.
 */
export const getParcoursDayVisualState = (
	day: Pick<ParcoursTimelineDay, "status" | "isAccessible">
): ParcoursDayVisualState =>
	day.status === "expired" && day.isAccessible ? "unfinished" : day.status;

/**
 * A week the subscription is withholding, as opposed to one the calendar has
 * simply not opened yet. The server decides this; the fallback keeps older
 * builds working against a payload that predates the flag.
 */
export const isParcoursWeekPaywalled = (
	week: Pick<ParcoursTimelineWeek, "isPaywalled" | "days">
) =>
	typeof week.isPaywalled === "boolean"
		? week.isPaywalled
		: (week.days || []).length > 0 &&
			(week.days || []).every((day) => day.isPaywalled);

/**
 * Upsell copy for the paywall sheet. `trial_expired` is the common case: the
 * user had their free week and it is over, so say that rather than implying
 * they never had access.
 */
export const getParcoursPaywallMessage = (
	reason: ParcoursFreemiumMeta["reason"] | undefined
) =>
	reason === "trial_expired"
		? "Ta semaine offerte est terminée. Passe à Premium pour continuer le parcours, semaine après semaine."
		: "Cette semaine fait partie du parcours Premium. Passe à Premium pour la débloquer.";
