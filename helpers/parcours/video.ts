import { StepStateRecord } from "@/helpers/parcours/progress";

const VIDEO_CHECKPOINT_MS = 10_000;

export const resolveParcoursVideoUri = (content: Record<string, unknown>) => {
	const directUri =
		content.videoUri && typeof content.videoUri === "object"
			? (content.videoUri as { url?: string | null }).url
			: null;

	if (typeof directUri === "string" && directUri.trim().length > 0) {
		return directUri;
	}

	return typeof content.videoLink === "string" && content.videoLink.trim().length > 0
		? content.videoLink
		: null;
};

export const getParcoursVideoCheckpoint = (positionMillis: number) =>
	Math.max(0, Math.floor(positionMillis / VIDEO_CHECKPOINT_MS) * VIDEO_CHECKPOINT_MS);

export const shouldPersistParcoursVideoCheckpoint = ({
	previousCheckpointMillis,
	nextPositionMillis,
}: {
	previousCheckpointMillis?: number | null;
	nextPositionMillis: number;
}) => getParcoursVideoCheckpoint(nextPositionMillis) !== (previousCheckpointMillis || 0);

export const buildParcoursVideoProgressPatch = ({
	positionMillis,
	durationMillis,
	nextUnlocked,
	completed,
}: {
	positionMillis: number;
	durationMillis?: number | null;
	nextUnlocked?: boolean;
	completed?: boolean;
}): StepStateRecord => ({
	videoCheckpointMillis: getParcoursVideoCheckpoint(positionMillis),
	videoDurationMillis:
		typeof durationMillis === "number" && Number.isFinite(durationMillis)
			? durationMillis
			: undefined,
	videoNextUnlocked: nextUnlocked,
	videoCompleted: completed,
});

export const hasParcoursVideoReachedNextThreshold = ({
	positionMillis,
	durationMillis,
}: {
	positionMillis: number;
	durationMillis?: number | null;
}) => {
	if (
		typeof durationMillis !== "number" ||
		!Number.isFinite(durationMillis) ||
		durationMillis <= 0
	) {
		return false;
	}

	return durationMillis - positionMillis <= VIDEO_CHECKPOINT_MS;
};

export const getParcoursVideoNextUnlocked = (
	stepState: StepStateRecord | undefined
) => Boolean(stepState?.videoNextUnlocked || stepState?.videoCompleted);
