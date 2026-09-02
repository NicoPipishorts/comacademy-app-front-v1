import { getPublicBaseUrl } from "@/helpers/api/buildApiUrl";
import { StepStateRecord } from "@/helpers/parcours/progress";

/**
 * How often watched time is persisted to the server while a parcours video
 * plays. Local threshold checks still run on every one-second tick.
 */
export const VIDEO_CHECKPOINT_MS = 5_000;
/** Share of the (server-provided) duration that must be watched to unlock "Suivant". */
export const VIDEO_NEXT_UNLOCK_RATIO = 0.9;

const normalizeBaseUrl = (value?: string | null) => {
	const raw = String(value || "").trim();
	if (!raw) {
		return null;
	}

	return raw.replace(/\/+$/u, "");
};

const getStrapiBaseUrl = () => {
	// Reuse the API URL resolver so relative `/uploads/...` media URLs get the
	// same localhost -> LAN host rewrite as API calls on physical devices.
	try {
		return normalizeBaseUrl(getPublicBaseUrl());
	} catch {
		// fall through to the raw env values below
	}

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

const toPositiveMillis = (value: unknown): number | null =>
	typeof value === "number" && Number.isFinite(value) && value > 0
		? value
		: null;

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

/**
 * Duration authored by the server in the step payload (probed from the media
 * file). Null when the server could not determine it.
 */
export const resolveParcoursVideoDurationMillis = (
	content: Record<string, unknown>
) => toPositiveMillis(content.videoDurationMillis);

/**
 * Pick the duration used for the 90% gate. The server value wins; the value
 * persisted with earlier progress comes next; the player's own metadata is
 * only a last resort because it can be missing or reported late.
 */
export const resolveParcoursVideoDuration = ({
	serverDurationMillis,
	persistedDurationMillis,
	playerDurationMillis,
}: {
	serverDurationMillis?: number | null;
	persistedDurationMillis?: number | null;
	playerDurationMillis?: number | null;
}) =>
	toPositiveMillis(serverDurationMillis) ??
	toPositiveMillis(persistedDurationMillis) ??
	toPositiveMillis(playerDurationMillis);

/** Milliseconds of real playback persisted for a step. */
export const getParcoursVideoWatchedMillis = (
	stepState: StepStateRecord | undefined
) => toPositiveMillis(stepState?.videoWatchedMillis) ?? 0;

export const getParcoursVideoCheckpoint = (positionMillis: number) =>
	Math.max(0, Math.floor(positionMillis / VIDEO_CHECKPOINT_MS) * VIDEO_CHECKPOINT_MS);

/** True when a metered value crossed a new checkpoint bucket since it was last persisted. */
export const shouldPersistParcoursVideoCheckpoint = ({
	previousCheckpointMillis,
	nextPositionMillis,
}: {
	previousCheckpointMillis?: number | null;
	nextPositionMillis: number;
}) =>
	nextPositionMillis > (previousCheckpointMillis || 0) &&
	getParcoursVideoCheckpoint(nextPositionMillis) !==
		getParcoursVideoCheckpoint(previousCheckpointMillis || 0);

export const buildParcoursVideoProgressPatch = ({
	positionMillis,
	watchedMillis,
	durationMillis,
	nextUnlocked,
	completed,
	rewatched,
	rewatchCount,
	startedAt,
	progressRecordedAt,
	reached90At,
	completedAt,
}: {
	positionMillis: number;
	watchedMillis?: number;
	durationMillis?: number | null;
	nextUnlocked?: boolean;
	completed?: boolean;
	rewatched?: boolean;
	rewatchCount?: number;
	startedAt?: string;
	progressRecordedAt?: string;
	reached90At?: string;
	completedAt?: string;
}): StepStateRecord => {
	const safeDurationMillis = toPositiveMillis(durationMillis);
	const safePositionMillis = Math.max(
		0,
		Number.isFinite(positionMillis) ? Math.round(positionMillis) : 0
	);
	const safeWatchedMillis = Math.max(
		0,
		typeof watchedMillis === "number" && Number.isFinite(watchedMillis)
			? Math.round(watchedMillis)
			: 0
	);

	return {
		// Resume position. Not proof of anything: the player can be seeked.
		videoCheckpointMillis: safePositionMillis,
		// Real playback metered from ticks. The server keeps the maximum of
		// existing and incoming values, so this only ever grows.
		videoWatchedMillis: safeWatchedMillis,
		videoDurationMillis: safeDurationMillis ?? undefined,
		videoProgressPercent: safeDurationMillis
			? Math.min(100, (safeWatchedMillis / safeDurationMillis) * 100)
			: undefined,
		videoNextUnlocked: nextUnlocked,
		videoCompleted: completed,
		videoStartedAt: startedAt,
		videoLastProgressAt: progressRecordedAt,
		videoReached90At: reached90At,
		videoCompletedAt: completedAt,
		videoRewatched: rewatched,
		videoRewatchCount:
			typeof rewatchCount === "number" && Number.isFinite(rewatchCount)
				? rewatchCount
				: undefined,
	};
};

/** Whether `watchedMillis` of real playback covers 90% of the duration. */
export const hasParcoursVideoReachedNextThreshold = ({
	watchedMillis,
	durationMillis,
}: {
	watchedMillis: number;
	durationMillis?: number | null;
}) => {
	const safeDurationMillis = toPositiveMillis(durationMillis);
	if (!safeDurationMillis) {
		return false;
	}

	return Math.max(0, watchedMillis) / safeDurationMillis >= VIDEO_NEXT_UNLOCK_RATIO;
};

export const hasUsableParcoursVideoStatus = ({
	isLoaded,
	durationMillis,
	didJustFinish,
}: {
	isLoaded: boolean;
	durationMillis?: number | null;
	didJustFinish: boolean;
}) => isLoaded || didJustFinish || Boolean(toPositiveMillis(durationMillis));

/**
 * Whether persisted progress proves the 90% gate. Flags and playback position
 * are never trusted on their own: expo-video fires its "ended" event on load,
 * and the app's own seek-to-end afterwards moves the position without any
 * playback. `fallbackDurationMillis` is the server duration for records that
 * were written before the duration was known.
 */
export const getParcoursVideoNextUnlocked = (
	stepState: StepStateRecord | undefined,
	fallbackDurationMillis?: number | null
) => {
	if (!stepState) {
		return false;
	}

	return hasParcoursVideoReachedNextThreshold({
		watchedMillis: getParcoursVideoWatchedMillis(stepState),
		durationMillis: resolveParcoursVideoDuration({
			serverDurationMillis: fallbackDurationMillis,
			persistedDurationMillis: stepState.videoDurationMillis,
		}),
	});
};

export const getParcoursVideoCompleted = (
	stepState: StepStateRecord | undefined,
	fallbackDurationMillis?: number | null
) =>
	Boolean(stepState?.videoCompleted) &&
	getParcoursVideoNextUnlocked(stepState, fallbackDurationMillis);

/**
 * Gate "Suivant" on every specific-rubrique step that has a playable video.
 * A media that failed to load releases the gate so the user is never trapped.
 */
export const shouldRequireParcoursVideoWatch = ({
	isSpecificRubriqueStep,
	videoUri,
	playbackFailed = false,
}: {
	isSpecificRubriqueStep: boolean;
	videoUri?: string | null;
	playbackFailed?: boolean;
}) =>
	isSpecificRubriqueStep &&
	!playbackFailed &&
	Boolean(String(videoUri || "").trim());
