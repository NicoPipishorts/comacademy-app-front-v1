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

export const EMPTY_RUBRIC_NOTIFICATIONS: RubricNotificationsResponse = {
	data: {
		rubrics: {
			citations: { hasUnread: false, lastOpenedAt: null, latestContentAt: null },
			metiers: { hasUnread: false, lastOpenedAt: null, latestContentAt: null },
			dico: { hasUnread: false, lastOpenedAt: null, latestContentAt: null },
			commandements: {
				hasUnread: false,
				lastOpenedAt: null,
				latestContentAt: null,
			},
			secrets: { hasUnread: false, lastOpenedAt: null, latestContentAt: null },
			"top-des-flops": {
				hasUnread: false,
				lastOpenedAt: null,
				latestContentAt: null,
			},
			"trente-secondes": {
				hasUnread: false,
				lastOpenedAt: null,
				latestContentAt: null,
			},
			feed: { hasUnread: false, lastOpenedAt: null, latestContentAt: null },
		},
	},
};
