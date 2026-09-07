import {
	getParcoursDayVisualState,
	getParcoursPaywallMessage,
	isParcoursWeekPaywalled,
} from "@/helpers/parcours/week";
import { ParcoursTimelineDay, ParcoursTimelineWeek } from "@/types/parcours";

const day = (overrides: Partial<ParcoursTimelineDay> = {}) =>
	({
		id: 1,
		documentId: null,
		dayKey: "monday",
		sortOrder: 1,
		themeTitle: null,
		themeSubtitle: null,
		accentColor: null,
		category: null,
		availableFrom: null,
		playableUntil: null,
		status: "locked",
		isAccessible: false,
		isPlayable: false,
		isReadOnly: false,
		isLocked: true,
		isPaywalled: false,
		currentStepIndex: 0,
		completedAt: null,
		...overrides,
	}) as ParcoursTimelineDay;

const week = (overrides: Partial<ParcoursTimelineWeek> = {}) =>
	({
		id: 1,
		documentId: null,
		title: "Semaine",
		slug: "semaine",
		weekLabel: null,
		programOrder: 1,
		weekStartAt: null,
		weekEndAt: null,
		timezone: "Europe/Paris",
		generationStatus: "published",
		status: "not_started",
		completedDaysCount: 0,
		totalDaysCount: 5,
		isPaywalled: false,
		bonus: null,
		days: [],
		...overrides,
	}) as ParcoursTimelineWeek;

describe("getParcoursDayVisualState", () => {
	it("marks a started day frozen by the cut-off as unfinished", () => {
		expect(
			getParcoursDayVisualState(
				day({ status: "expired", isAccessible: true, isLocked: false })
			)
		).toBe("unfinished");
	});

	it("leaves a day never opened before the cut-off as expired", () => {
		expect(
			getParcoursDayVisualState(day({ status: "expired", isAccessible: false }))
		).toBe("expired");
	});

	it("passes every other status straight through", () => {
		expect(
			getParcoursDayVisualState(day({ status: "ready", isAccessible: true }))
		).toBe("ready");
		expect(
			getParcoursDayVisualState(day({ status: "completed", isAccessible: true }))
		).toBe("completed");
	});
});

describe("isParcoursWeekPaywalled", () => {
	it("trusts the week flag from the server", () => {
		expect(isParcoursWeekPaywalled(week({ isPaywalled: true }))).toBe(true);
		expect(isParcoursWeekPaywalled(week({ isPaywalled: false }))).toBe(false);
	});

	it("falls back to the days when the week flag is missing", () => {
		const legacy = week({
			days: [day({ isPaywalled: true }), day({ id: 2, isPaywalled: true })],
		});
		delete (legacy as Partial<ParcoursTimelineWeek>).isPaywalled;

		expect(isParcoursWeekPaywalled(legacy)).toBe(true);
	});

	it("does not treat a merely locked future week as paywalled", () => {
		const legacy = week({
			days: [day({ isPaywalled: false }), day({ id: 2, isPaywalled: false })],
		});
		delete (legacy as Partial<ParcoursTimelineWeek>).isPaywalled;

		expect(isParcoursWeekPaywalled(legacy)).toBe(false);
	});
});

describe("getParcoursPaywallMessage", () => {
	it("says the free week is spent once the trial expired", () => {
		expect(getParcoursPaywallMessage("trial_expired")).toContain(
			"semaine offerte est terminée"
		);
	});

	it("falls back to a generic premium message otherwise", () => {
		expect(getParcoursPaywallMessage("trial_active")).toContain(
			"parcours Premium"
		);
		expect(getParcoursPaywallMessage(undefined)).toContain("parcours Premium");
	});
});
