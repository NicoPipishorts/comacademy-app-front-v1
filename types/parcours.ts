export type ParcoursDayStatus =
	| "ready"
	| "in_progress"
	| "completed"
	| "expired"
	| "locked";

export interface ParcoursCategory {
	id: number;
	name: string | null;
	title: string | null;
	color: string | null;
}

export interface ParcoursBonus {
	id: number;
	title: string;
	status: "locked" | "unlocked" | "viewed";
	unlockedAt: string | null;
}

export interface ParcoursTimelineDay {
	id: number;
	documentId: string | null;
	dayKey: string;
	sortOrder: number;
	themeTitle: string | null;
	themeSubtitle: string | null;
	accentColor: string | null;
	category: ParcoursCategory | null;
	availableFrom: string | null;
	playableUntil: string | null;
	status: ParcoursDayStatus;
	isAccessible: boolean;
	isPlayable: boolean;
	isReadOnly: boolean;
	isLocked: boolean;
	currentStepIndex: number;
	completedAt: string | null;
}

export interface ParcoursTimelineWeek {
	id: number;
	documentId: string | null;
	title: string;
	slug: string;
	weekLabel: string | null;
	programOrder: number;
	weekStartAt: string | null;
	weekEndAt: string | null;
	timezone: string;
	generationStatus: string;
	status: "not_started" | "in_progress" | "completed" | "expired";
	completedDaysCount: number;
	totalDaysCount: number;
	bonus: ParcoursBonus | null;
	days: ParcoursTimelineDay[];
}

export interface ParcoursWeekDetail extends ParcoursTimelineWeek {}

export interface ParcoursDayDetail {
	id: number;
	documentId: string | null;
	dayKey: string;
	sortOrder: number;
	themeTitle: string | null;
	themeSubtitle: string | null;
	structureVersion: number;
	estimatedDurationSec: number | null;
	accentColor: string | null;
	category: ParcoursCategory | null;
	availableFrom: string | null;
	playableUntil: string | null;
	stepsPayload: {
		version?: number;
		dayMeta?: {
			title?: string;
			dateLabel?: string;
			totalSteps?: number;
		};
		steps?: Array<Record<string, unknown>>;
	} | null;
	progression: {
		status: ParcoursDayStatus;
		isPlayable: boolean;
		isReadOnly: boolean;
		currentStepIndex: number;
		startedAt: string | null;
		lastSeenAt: string | null;
		completedAt: string | null;
		lastProgressPayload: Record<string, unknown> | null;
	};
	week: {
		id: number;
		title: string;
		programOrder: number;
		status: "not_started" | "in_progress" | "completed" | "expired";
		bonus?: ParcoursBonus | null;
		completedDaysCount?: number;
		totalDaysCount?: number;
	};
}

export interface ParcoursResponse<T> {
	data: T;
	meta: {
		timezone: string;
		currentWeekOrder?: number;
		startedAt?: string;
		unlockedDayCountInCurrentWeek?: number;
	};
}

export interface ParcoursDayProgressPayload {
	currentStepIndex: number;
	lastProgressPayload?: Record<string, unknown> | null;
}
