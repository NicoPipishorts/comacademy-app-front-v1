import { ParcoursDayStep } from "@/types/parcours";

export type StepStateRecord = {
	citationRevealProgress?: number;
	citationRevealed?: boolean;
	selectedAnswerKey?: string;
	answerSubmittedKey?: string;
	correctAnswerKey?: string;
	answerWasCorrect?: boolean;
	answerLocked?: boolean;
	answered?: boolean;
	videoCheckpointMillis?: number;
	videoDurationMillis?: number;
	videoNextUnlocked?: boolean;
	videoCompleted?: boolean;
	videoRewatched?: boolean;
	videoRewatchCount?: number;
	gameSessionId?: number;
	gameAnsweredCount?: number;
	gameQuestionCount?: number;
	gameCompleted?: boolean;
	tipsPairIndex?: number;
	tipsPhase?: "question" | "card";
	tipsProgress?: Record<string, StepStateRecord>;
};

export type ProgressPayload = {
	activeStepId?: string | null;
	stepState?: Record<string, StepStateRecord>;
	[key: string]: unknown;
};

export const getProgressPayload = (
	value: Record<string, unknown> | string | null | undefined
): ProgressPayload => {
	if (!value) {
		return {};
	}

	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value) as unknown;
			return parsed && typeof parsed === "object" ? (parsed as ProgressPayload) : {};
		} catch {
			return {};
		}
	}

	return typeof value === "object" ? (value as ProgressPayload) : {};
};

export const getStepState = (
	payload: Record<string, unknown> | string | null | undefined,
	stepId?: string | null
): StepStateRecord => {
	if (!stepId) {
		return {};
	}

	const progressPayload = getProgressPayload(payload);
	const rawStepState = progressPayload.stepState;
	const stepStateMap =
		rawStepState && typeof rawStepState === "string"
			? getProgressPayload(rawStepState).stepState || {}
			: rawStepState || {};
	const entry = stepStateMap[stepId];

	if (!entry) {
		return {};
	}

	if (typeof entry === "string") {
		try {
			const parsed = JSON.parse(entry) as unknown;
			return parsed && typeof parsed === "object"
				? (parsed as StepStateRecord)
				: {};
		} catch {
			return {};
		}
	}

	return typeof entry === "object" ? (entry as StepStateRecord) : {};
};

export const getActiveStepId = (
	payload: Record<string, unknown> | string | null | undefined
) => {
	const progressPayload = getProgressPayload(payload);
	return typeof progressPayload.activeStepId === "string"
		? progressPayload.activeStepId
		: null;
};

export const mergeProgressPayload = ({
	basePayload,
	activeStepId,
	stepId,
	stepPatch,
}: {
	basePayload: Record<string, unknown> | string | null | undefined;
	activeStepId?: string | null;
	stepId?: string | null;
	stepPatch?: StepStateRecord;
}): ProgressPayload => {
	const current = getProgressPayload(basePayload);
	const nextStepState = { ...(current.stepState || {}) };

	if (stepId && stepPatch) {
		nextStepState[stepId] = {
			...(nextStepState[stepId] || {}),
			...stepPatch,
		};
	}

	return {
		...current,
		activeStepId: activeStepId ?? current.activeStepId ?? null,
		stepState: nextStepState,
	};
};

export const resolveInitialParcoursStepIndex = ({
	steps,
	currentStepIndex,
	progressionStatus,
	lastProgressPayload,
	getStepId,
}: {
	steps: ParcoursDayStep[];
	currentStepIndex?: number | null;
	progressionStatus?: string | null;
	lastProgressPayload?: Record<string, unknown> | string | null;
	getStepId: (step: ParcoursDayStep, index: number) => string;
}) => {
	if (progressionStatus === "completed") {
		return 0;
	}

	const activeStepId = getActiveStepId(lastProgressPayload);
	if (activeStepId) {
		const activeStepIndex = steps.findIndex(
			(step, index) => getStepId(step, index) === activeStepId
		);

		if (activeStepIndex >= 0) {
			return activeStepIndex;
		}
	}

	return currentStepIndex || 0;
};
