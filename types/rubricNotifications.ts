export const TRACKED_RUBRIC_KEYS = [
	"citations",
	"metiers",
	"dico",
	"commandements",
	"secrets",
	"top-des-flops",
	"trente-secondes",
	"feed",
] as const;

export type RubricKey = (typeof TRACKED_RUBRIC_KEYS)[number];

export type RubricNotificationStatus = {
	hasUnread: boolean;
	lastOpenedAt: string | null;
	latestContentAt: string | null;
};

export type RubricNotificationsMap = Record<RubricKey, RubricNotificationStatus>;

export type RubricNotificationsResponse = {
	data: {
		rubrics: RubricNotificationsMap;
	};
};
