import { StepStateRecord } from "@/helpers/parcours/progress";

const VIDEO_CHECKPOINT_MS = 10_000;
const VIDEO_NEXT_UNLOCK_THRESHOLD_MS = 5_000;

const normalizeBaseUrl = (value?: string | null) => {
	const raw = String(value || "").trim();
	if (!raw) {
		return null;
	}

	return raw.replace(/\/+$/u, "");
};

const getStrapiBaseUrl = () => {
	const publicUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_URL);
	if (publicUrl) {
		return publicUrl;
	}

	const apiUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
	if (!apiUrl) {
		return null;
	}

	return apiUrl.replace(/\/api$/u, "");
};

const toAbsoluteVideoUrl = (value?: string | null) => {
	const raw = String(value || "").trim();
	if (!raw) {
		return null;
	}

	if (/^https?:\/\//iu.test(raw)) {
		return raw;
	}

	if (!raw.startsWith("/")) {
		return raw;
	}

	const baseUrl = getStrapiBaseUrl();
	return baseUrl ? `${baseUrl}${raw}` : raw;
};

export const resolveParcoursVideoUri = (content: Record<string, unknown>) => {
	const directUri =
		content.videoUri && typeof content.videoUri === "object"
			? (content.videoUri as { url?: string | null }).url
			: null;

	const absoluteDirectUri = toAbsoluteVideoUrl(directUri);
	if (absoluteDirectUri) {
		return absoluteDirectUri;
	}

	return typeof content.videoLink === "string"
		? toAbsoluteVideoUrl(content.videoLink)
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
	rewatched,
	rewatchCount,
}: {
	positionMillis: number;
	durationMillis?: number | null;
	nextUnlocked?: boolean;
	completed?: boolean;
	rewatched?: boolean;
	rewatchCount?: number;
}): StepStateRecord => ({
	videoCheckpointMillis: getParcoursVideoCheckpoint(positionMillis),
	videoDurationMillis:
		typeof durationMillis === "number" && Number.isFinite(durationMillis)
			? durationMillis
			: undefined,
	videoNextUnlocked: nextUnlocked,
	videoCompleted: completed,
	videoRewatched: rewatched,
	videoRewatchCount:
		typeof rewatchCount === "number" && Number.isFinite(rewatchCount)
			? rewatchCount
			: undefined,
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

	return durationMillis - positionMillis <= VIDEO_NEXT_UNLOCK_THRESHOLD_MS;
};

export const getParcoursVideoNextUnlocked = (
	stepState: StepStateRecord | undefined
) => Boolean(stepState?.videoNextUnlocked || stepState?.videoCompleted);
