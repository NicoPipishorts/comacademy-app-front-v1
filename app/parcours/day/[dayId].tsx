import {
	useCompleteParcoursDay,
	useParcoursDay,
	useStartParcoursDay,
	useUpdateParcoursDayProgress,
} from "@/api/parcours/useParcours";
import { useParcoursGameSession } from "@/api/game/useParcoursGameSession";
import { useInsertAnswer } from "@/api/game/useInsertAnswer";
import CommandementCard from "@/components/cards/CommandementCard";
import ParcoursCitationRevealCard from "@/components/parcours/ParcoursCitationRevealCard";
import ParcoursCitationOnboardingStep, {
	CITATION_ONBOARDING_BACKGROUND,
} from "@/components/parcours/ParcoursCitationOnboardingStep";
import ParcoursDayCompletionScreen from "@/components/parcours/ParcoursDayCompletionScreen";
import ParcoursDayHeader from "@/components/parcours/ParcoursDayHeader";
import ParcoursDicoOnboardingStep, {
	DICO_ONBOARDING_BACKGROUND,
} from "@/components/parcours/ParcoursDicoOnboardingStep";
import ParcoursDicoQuestionStep from "@/components/parcours/ParcoursDicoQuestionStep";
import ParcoursGameOnboardingStep, {
	GAME_ONBOARDING_BACKGROUND,
} from "@/components/parcours/ParcoursGameOnboardingStep";
import ParcoursGameAnswersReview from "@/components/parcours/ParcoursGameAnswersReview";
import ParcoursGameQuestionStep from "@/components/parcours/ParcoursGameQuestionStep";
import ParcoursSpecificRubriqueVideoStep from "@/components/parcours/ParcoursSpecificRubriqueVideoStep";
import ParcoursTipsOnboardingStep, {
	TIPS_ONBOARDING_BACKGROUND,
} from "@/components/parcours/ParcoursTipsOnboardingStep";
import ParcoursVideoOnboardingStep, {
	VIDEO_ONBOARDING_BACKGROUND,
} from "@/components/parcours/ParcoursVideoOnboardingStep";
import Loader from "@/components/experience/loader";
import ParcoursComingSoonScreen from "@/components/parcours/ParcoursComingSoonScreen";
import ParcoursFloatingNav from "@/components/parcours/ParcoursFloatingNav";
import ParcoursStepTimer from "@/components/parcours/ParcoursStepTimer";
import ParcoursTimeoutFeedback from "@/components/parcours/ParcoursTimeoutFeedback";
import {
	colorBlack,
	colorDarkGrey,
	colorWhite,
} from "@/constants/colors";
import {
	FontSize14,
	FontSize16,
} from "@/constants/fontsizes";
import { isParcoursEnabled } from "@/constants/featureFlags";
import {
	buildTimedOutParcoursDicoStepPatch,
	buildValidatedParcoursDicoStepPatch,
	getParcoursDicoAnswers,
	resolveParcoursDicoState,
} from "@/helpers/parcours/dico";
import {
	buildParcoursGameStepPatch,
	resolveParcoursGameState,
} from "@/helpers/parcours/game";
import {
	buildParcoursTipsPairPatch,
	buildTimedOutParcoursTipsPairPatch,
	buildValidatedParcoursTipsPairPatch,
	resolveParcoursTipsState,
} from "@/helpers/parcours/tips";
import {
	formatParcoursDayDate,
	resolveParcoursAccentColor,
} from "@/helpers/parcours/theme";
import {
	buildParcoursVideoProgressPatch,
	getParcoursVideoCheckpoint,
	getParcoursVideoNextUnlocked,
	hasParcoursVideoReachedNextThreshold,
	resolveParcoursVideoUri,
	shouldPersistParcoursVideoCheckpoint,
} from "@/helpers/parcours/video";
import { getReviewableParcoursSteps } from "@/helpers/parcours/review";
import {
	getProgressPayload,
	getStepState,
	mergeProgressPayload,
	resolveInitialParcoursStepIndex,
	StepStateRecord,
} from "@/helpers/parcours/progress";
import {
	getParcoursStepId,
	isCitationParcoursStep,
	isDicoQuestionParcoursStep,
	isGameBlockParcoursStep,
	isSpecificRubriqueParcoursStep,
	isTipsAndTacticsParcoursStep,
	toParcoursDayStep,
} from "@/helpers/parcours/steps";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";
import { useGetEndOfSessionResults } from "@/hooks/useGetEndOfSession";
import { Answer } from "@/types/enums";
import { CompatVideoStatus } from "@/components/media/ExpoVideo";
import {
	ParcoursDayStep,
} from "@/types/parcours";
import { QuestionData } from "@/types/userGameSessionStatus";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FeedbackMessage from "../../(tabs)/leJeu/feedbackMessage";
import {
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function StepFallback({ step }: { step: ParcoursDayStep }) {
	return (
		<View style={styles.fallbackCard}>
			<Text style={styles.fallbackType}>
				{String(step.type || "Etape").replace(/_/g, " ")}
			</Text>
			<Text style={styles.fallbackBody}>
				Cette etape n&apos;est pas encore designée dans le player parcours.
			</Text>
		</View>
	);
}

type ParcoursOnboardingKind = "tips" | "video" | "game";

const getParcoursOnboardingKind = (
	step: ParcoursDayStep | null | undefined
): ParcoursOnboardingKind | null => {
	if (isTipsAndTacticsParcoursStep(step)) {
		return "tips";
	}

	if (isGameBlockParcoursStep(step)) {
		return "game";
	}

	if (isSpecificRubriqueParcoursStep(step)) {
		const content =
			step.content && typeof step.content === "object" ? step.content : {};
		return resolveParcoursVideoUri(content) ? "video" : null;
	}

	return null;
};

const getParcoursOnboardingBackground = (
	kind: ParcoursOnboardingKind | null
) => {
	switch (kind) {
		case "tips":
			return TIPS_ONBOARDING_BACKGROUND;
		case "video":
			return VIDEO_ONBOARDING_BACKGROUND;
		case "game":
			return GAME_ONBOARDING_BACKGROUND;
		default:
			return null;
	}
};

export default function ParcoursDayScreen() {
	if (!isParcoursEnabled) {
		return <ParcoursComingSoonScreen />;
	}

	return <ParcoursDayContent />;
}

function ParcoursDayContent() {
	const insets = useSafeAreaInsets();
	const { width: screenWidth } = useWindowDimensions();
	const { auth } = useAuthSession();
	const params = useLocalSearchParams<{ dayId?: string | string[] }>();
	const dayId = Number(Array.isArray(params.dayId) ? params.dayId[0] : params.dayId);
	const { token, loading: loadingToken } = useJwtToken();
	const { data, isLoading } = useParcoursDay(
		Number.isFinite(dayId) ? dayId : null,
		token,
		loadingToken
	);
	const startDay = useStartParcoursDay();
	const updateProgress = useUpdateParcoursDayProgress();
	const completeDay = useCompleteParcoursDay();
	const insertGameAnswer = useInsertAnswer();
	const hasStartedRef = useRef(false);
	const revealPersistedRef = useRef(false);
	const gameSessionSyncKeyRef = useRef<string | null>(null);
	const videoCompletionPersistedStepIdRef = useRef<string | null>(null);
	const dicoOnboardingAdvancedStepIdsRef = useRef<Record<string, boolean>>({});
	const onboardingAdvancedStepIdsRef = useRef<Record<string, boolean>>({});
	const progressWriteQueueRef = useRef<Promise<unknown>>(Promise.resolve());
	const progressPayloadDayIdRef = useRef<number | null>(null);
	const day = data?.data;

	const steps = useMemo(() => {
		const payloadSteps = Array.isArray(day?.stepsPayload?.steps)
			? day.stepsPayload.steps.map(toParcoursDayStep)
			: [];

		if (day?.progression.status !== "expired") {
			return payloadSteps;
		}

		return getReviewableParcoursSteps({
			steps: payloadSteps,
			currentStepIndex: day.progression.currentStepIndex,
			lastProgressPayload: day.progression.lastProgressPayload,
		});
	}, [
		day?.progression.currentStepIndex,
		day?.progression.lastProgressPayload,
		day?.progression.status,
		day?.stepsPayload?.steps,
	]);
	const hasNoReviewableSteps = Boolean(
		day?.progression.isReadOnly && steps.length === 0
	);
	const isHistoricalReview = Boolean(
		day &&
			typeof data?.meta.currentWeekOrder === "number" &&
			day.week.programOrder < data.meta.currentWeekOrder
	);
	const isCompletedReview = day?.progression.status === "completed";
	const isReviewMode = isHistoricalReview || isCompletedReview;
	const totalSteps =
		day?.progression.status === "expired"
			? steps.length
			: day?.stepsPayload?.dayMeta?.totalSteps || steps.length;
	const initialIndex = useMemo(
		() => {
			const resolvedIndex = resolveInitialParcoursStepIndex({
				steps,
				currentStepIndex: day?.progression?.currentStepIndex,
				progressionStatus: day?.progression?.status,
				lastProgressPayload: day?.progression?.lastProgressPayload,
				getStepId: getParcoursStepId,
			});

			if (isReviewMode) {
				return resolvedIndex;
			}

			const resolvedStep = steps[resolvedIndex] || null;
			const previousStepIndex = resolvedIndex - 1;
			const previousStep = steps[previousStepIndex] || null;
			const previousStepId = getParcoursStepId(previousStep, previousStepIndex);
			const previousStepState = getStepState(
				day?.progression?.lastProgressPayload,
				previousStepId
			);
			const resolvedStepId = getParcoursStepId(resolvedStep, resolvedIndex);
			const resolvedStepState = getStepState(
				day?.progression?.lastProgressPayload,
				resolvedStepId
			);
			const onboardingKind = getParcoursOnboardingKind(resolvedStep);

			if (
				isDicoQuestionParcoursStep(resolvedStep) &&
				isCitationParcoursStep(previousStep) &&
				previousStepState.citationRevealed &&
				!dicoOnboardingAdvancedStepIdsRef.current[resolvedStepId]
			) {
				return previousStepIndex;
			}

			if (
				onboardingKind &&
				previousStep &&
				!(
					onboardingKind === "video" &&
					Boolean(resolvedStepState.videoCompleted)
				) &&
				!onboardingAdvancedStepIdsRef.current[resolvedStepId]
			) {
				return previousStepIndex;
			}

			return resolvedIndex;
		},
		[
			day?.progression?.currentStepIndex,
			day?.progression?.lastProgressPayload,
			day?.progression?.status,
			isReviewMode,
			steps,
		]
	);

	const [activeIndex, setActiveIndex] = useState(initialIndex);
	const [lastProgressPayload, setLastProgressPayload] = useState<Record<string, unknown> | null>(
		day?.progression?.lastProgressPayload || null
	);
	const [isScratchGestureActive, setIsScratchGestureActive] = useState(false);
	const [locallyRevealedStepId, setLocallyRevealedStepId] = useState<string | null>(null);
	const [draftAnswerByStepId, setDraftAnswerByStepId] = useState<Record<string, string>>({});
	const [feedbackAnswer, setFeedbackAnswer] = useState<Answer | null>(null);
	const [timeoutFeedbackLabel, setTimeoutFeedbackLabel] = useState<string | null>(null);
	const [isDayCompletionScreenVisible, setIsDayCompletionScreenVisible] =
		useState(false);
	const [isFinalizingGameStep, setIsFinalizingGameStep] = useState(false);
	const [optimisticGameQuestions, setOptimisticGameQuestions] = useState<QuestionData[] | null>(
		null
	);
	const [seenDicoOnboardingStepIds, setSeenDicoOnboardingStepIds] = useState<
		Record<string, boolean>
	>({});
	const [pendingDicoOnboardingStepIndex, setPendingDicoOnboardingStepIndex] =
		useState<number | null>(null);
	const [seenOnboardingStepIds, setSeenOnboardingStepIds] = useState<
		Record<string, boolean>
	>({});
	const [pendingOnboardingStepIndex, setPendingOnboardingStepIndex] = useState<
		number | null
	>(null);
	const [tipsReviewStateByStepId, setTipsReviewStateByStepId] = useState<
		Record<string, { pairIndex: number; phase: "question" | "card" }>
	>({});
	const [locallyUnlockedVideoStepId, setLocallyUnlockedVideoStepId] = useState<string | null>(
		null
	);
	const lastProgressPayloadRef = useRef<Record<string, unknown> | null>(
		day?.progression?.lastProgressPayload || null
	);
	const pendingCorrectAdvanceRef = useRef(false);
	const dicoFinalizingRef = useRef(false);
	const tipsFinalizingRef = useRef(false);
	const pendingDayCompletionRef = useRef(false);
	const specificVideoProgressRef = useRef<{
		stepId: string | null;
		checkpointMillis: number;
		positionMillis: number;
		durationMillis: number | null;
		nextUnlocked: boolean;
		completed: boolean;
		rewatchedHalf: boolean;
		rewatchCountIncremented: boolean;
	}>({
		stepId: null,
		checkpointMillis: 0,
		positionMillis: 0,
		durationMillis: null,
		nextUnlocked: false,
		completed: false,
		rewatchedHalf: false,
		rewatchCountIncremented: false,
	});

	useEffect(() => {
		setActiveIndex(initialIndex);
	}, [initialIndex]);

	useEffect(() => {
		const serverPayload = getProgressPayload(
			day?.progression?.lastProgressPayload
		);
		if (progressPayloadDayIdRef.current !== (day?.id ?? null)) {
			progressPayloadDayIdRef.current = day?.id ?? null;
			lastProgressPayloadRef.current = serverPayload;
			setLastProgressPayload(serverPayload);
			return;
		}

		setLastProgressPayload((currentPayload) => {
			const current = getProgressPayload(currentPayload);
			const merged = {
				...serverPayload,
				...current,
				stepState: {
					...(serverPayload.stepState || {}),
					...(current.stepState || {}),
				},
			};
			lastProgressPayloadRef.current = merged;
			return merged;
		});
	}, [day?.id, day?.progression?.lastProgressPayload]);

	useEffect(() => {
		setLocallyRevealedStepId(null);
		revealPersistedRef.current = false;
		gameSessionSyncKeyRef.current = null;
		videoCompletionPersistedStepIdRef.current = null;
		setDraftAnswerByStepId({});
		setFeedbackAnswer(null);
		setTimeoutFeedbackLabel(null);
		setIsDayCompletionScreenVisible(false);
		setIsFinalizingGameStep(false);
		setOptimisticGameQuestions(null);
		setSeenDicoOnboardingStepIds({});
		setPendingDicoOnboardingStepIndex(null);
		setSeenOnboardingStepIds({});
		setPendingOnboardingStepIndex(null);
		dicoOnboardingAdvancedStepIdsRef.current = {};
		onboardingAdvancedStepIdsRef.current = {};
		setTipsReviewStateByStepId({});
		setLocallyUnlockedVideoStepId(null);
		pendingCorrectAdvanceRef.current = false;
		pendingDayCompletionRef.current = false;
	}, [day?.id]);

	useEffect(() => {
		if (!day || !token || hasStartedRef.current) {
			return;
		}

		if (day.progression.status === "ready") {
			hasStartedRef.current = true;
			void startDay.mutateAsync({ dayId: day.id, token });
			return;
		}

		if (day.progression.status === "in_progress") {
			hasStartedRef.current = true;
		}
	}, [day, startDay, token]);

	const currentStep = steps[activeIndex] || null;
	const currentStepId = getParcoursStepId(currentStep, activeIndex);
	const previousStepIndex = activeIndex - 1;
	const previousStep = steps[previousStepIndex] || null;
	const previousStepId = getParcoursStepId(previousStep, previousStepIndex);
	const nextStepIndex = activeIndex + 1;
	const nextStep = steps[nextStepIndex] || null;
	const nextStepId = getParcoursStepId(nextStep, nextStepIndex);
	const currentStepContent =
		currentStep?.content && typeof currentStep.content === "object"
			? currentStep.content
			: {};
	const currentAccentColor = resolveParcoursAccentColor(
		String(currentStepContent.accentColor || ""),
		day?.accentColor,
		day?.category?.color
	);
	const persistedStepState = useMemo(
		() => ({
			...getStepState(day?.progression?.lastProgressPayload, currentStepId),
			...getStepState(lastProgressPayload, currentStepId),
		}),
		[currentStepId, day?.progression?.lastProgressPayload, lastProgressPayload]
	);
	const previousStepState = useMemo(
		() => ({
			...getStepState(day?.progression?.lastProgressPayload, previousStepId),
			...getStepState(lastProgressPayload, previousStepId),
		}),
		[previousStepId, day?.progression?.lastProgressPayload, lastProgressPayload]
	);
	const nextStepState = useMemo(
		() => ({
			...getStepState(day?.progression?.lastProgressPayload, nextStepId),
			...getStepState(lastProgressPayload, nextStepId),
		}),
		[nextStepId, day?.progression?.lastProgressPayload, lastProgressPayload]
	);
	const dayDateLabel = formatParcoursDayDate(
		day?.availableFrom,
		day?.stepsPayload?.dayMeta?.dateLabel
	);

	const isCitationStep = isCitationParcoursStep(currentStep);
	const shouldShowCitationOnboarding = Boolean(
		!isReviewMode &&
			isCitationStep &&
			currentStepId &&
			!seenOnboardingStepIds[currentStepId]
	);
	const isDicoStep = isDicoQuestionParcoursStep(currentStep);
	const isGameStep = isGameBlockParcoursStep(currentStep);
	const isSpecificRubriqueStep = isSpecificRubriqueParcoursStep(currentStep);
	const isTipsStep = isTipsAndTacticsParcoursStep(currentStep);
	const citationRevealed =
		Boolean(persistedStepState.citationRevealed) ||
		locallyRevealedStepId === currentStepId;
	const previousCitationRevealed =
		Boolean(previousStepState.citationRevealed) ||
		locallyRevealedStepId === previousStepId;
	const dicoOnboardingStepIndex =
		pendingDicoOnboardingStepIndex !== null
			? pendingDicoOnboardingStepIndex
			: isDicoStep &&
				  isCitationParcoursStep(previousStep) &&
				  previousCitationRevealed
			? activeIndex
			: null;
	const dicoOnboardingStepId =
		dicoOnboardingStepIndex === activeIndex
			? currentStepId
			: dicoOnboardingStepIndex === nextStepIndex
				? nextStepId
				: null;
	const shouldShowDicoOnboarding =
		Boolean(
			!isReviewMode &&
				dicoOnboardingStepId &&
				dicoOnboardingStepIndex !== null &&
				!seenDicoOnboardingStepIds[dicoOnboardingStepId]
		);
	const pendingOnboardingStep =
		pendingOnboardingStepIndex !== null
			? steps[pendingOnboardingStepIndex] || null
			: null;
	const pendingOnboardingStepId =
		pendingOnboardingStepIndex !== null
			? getParcoursStepId(
					pendingOnboardingStep,
					pendingOnboardingStepIndex
			  )
			: null;
	const pendingOnboardingKind = getParcoursOnboardingKind(
		pendingOnboardingStep
	);
	const shouldShowStepOnboarding = Boolean(
		!isReviewMode &&
			pendingOnboardingStepId &&
			pendingOnboardingKind &&
			!seenOnboardingStepIds[pendingOnboardingStepId]
	);

	const dicoAnswers = getParcoursDicoAnswers(currentStepContent);
	const {
		answered: dicoAnswered,
		correctAnswerKey: dicoCorrectAnswerKey,
		selectedAnswerKey: dicoDisplayedAnswerKey,
		submittedAnswerKey: dicoSubmittedAnswerKey,
		answerLocked: dicoAnswerLocked,
		hasSelection: dicoHasSelection,
		answerWasCorrect: dicoAnswerWasCorrect,
		persistedCorrectAnswerKey: dicoPersistedCorrectAnswerKey,
	} = resolveParcoursDicoState({
		content: currentStepContent,
		stepState: persistedStepState,
		draftAnswerKey: draftAnswerByStepId[currentStepId],
		isReadOnly: day?.progression.isReadOnly,
	});
	const isReadOnlyTipsReview = Boolean(day?.progression.isReadOnly && isTipsStep);
	const localTipsReviewState = isReadOnlyTipsReview
		? tipsReviewStateByStepId[currentStepId] || {
				pairIndex: 0,
				phase: "question" as const,
		  }
		: null;
	const effectiveTipsStepState =
		isReadOnlyTipsReview && localTipsReviewState
			? {
					...persistedStepState,
					tipsPairIndex: localTipsReviewState.pairIndex,
					tipsPhase: localTipsReviewState.phase,
			  }
			: persistedStepState;
	const tipsDraftKey = `${currentStepId}:${
		typeof effectiveTipsStepState.tipsPairIndex === "number"
			? effectiveTipsStepState.tipsPairIndex
			: 0
	}`;
	const {
		currentPair: tipsCurrentPair,
		pairIndex: tipsPairIndex,
		phase: tipsPhase,
		isLastPair: tipsIsLastPair,
		answered: tipsAnswered,
		correctAnswerKey: tipsCorrectAnswerKey,
		selectedAnswerKey: tipsDisplayedAnswerKey,
		submittedAnswerKey: tipsSubmittedAnswerKey,
		answerLocked: tipsAnswerLocked,
		hasSelection: tipsHasSelection,
		answerWasCorrect: tipsAnswerWasCorrect,
		persistedCorrectAnswerKey: tipsPersistedCorrectAnswerKey,
	} = resolveParcoursTipsState({
		content: currentStepContent,
		stepState: effectiveTipsStepState,
		draftAnswerKey: draftAnswerByStepId[tipsDraftKey],
		isReadOnly: day?.progression.isReadOnly,
	});
	const tipsPairDraftKey = `${currentStepId}:${tipsPairIndex}`;
	const tipsQuestionAnswers = tipsCurrentPair?.answers || [];
	const isTipsQuestionPhase = isTipsStep && tipsPhase === "question";
	const isTipsCardPhase = isTipsStep && tipsPhase === "card";
	const commandementCardWidth = Math.min(Math.max(screenWidth - 48, 280), 360);
	const requiresReveal = isCitationStep && currentStep?.stateMode === "reveal_once";
	const gameQuestionCount =
		typeof currentStepContent.questionCount === "number" &&
		currentStepContent.questionCount > 0
			? Math.floor(currentStepContent.questionCount)
			: 5;
	const gameCategoryStaticId =
		typeof currentStepContent.categoryStaticId === "number" &&
		Number.isFinite(currentStepContent.categoryStaticId)
			? currentStepContent.categoryStaticId
			: null;
	const specificVideoUri = resolveParcoursVideoUri(currentStepContent);
	const specificVideoNextUnlocked =
		getParcoursVideoNextUnlocked(persistedStepState) ||
		locallyUnlockedVideoStepId === currentStepId;
	const specificVideoResumeMillis =
		Boolean(persistedStepState.videoCompleted)
			? Math.max(
					(typeof persistedStepState.videoDurationMillis === "number"
						? persistedStepState.videoDurationMillis
						: persistedStepState.videoCheckpointMillis || 0) - 250,
					0
			  )
			: typeof persistedStepState.videoCheckpointMillis === "number"
			? persistedStepState.videoCheckpointMillis
			: 0;
	const requiresSpecificVideoWatch =
		isSpecificRubriqueStep &&
		(currentStepContent.rubriqueType === "thirty_seconds" ||
			currentStepContent.rubriqueType === "top_deflop") &&
		Boolean(specificVideoUri);
	const persistedGameSessionId =
		typeof persistedStepState.gameSessionId === "number" &&
		Number.isFinite(persistedStepState.gameSessionId)
			? persistedStepState.gameSessionId
			: null;
	const { data: completedGameResults, isLoading: isLoadingCompletedGameResults } =
		useGetEndOfSessionResults(
			isCompletedReview && isGameStep ? persistedGameSessionId || 0 : 0
		);
	const {
		data: parcoursGameSessionData,
		isLoading: isLoadingParcoursGameSession,
		refetch: refetchParcoursGameSession,
	} = useParcoursGameSession({
		userId: auth?.user.id,
		categoryId: isGameStep ? gameCategoryStaticId : null,
		questionCount: gameQuestionCount,
		sessionId: isGameStep ? persistedGameSessionId : null,
		token,
		loadingToken,
	});
	const parcoursGameSession = parcoursGameSessionData?.data ?? null;
	const {
		sessionId: parcoursGameSessionId,
		answeredCount: parcoursGameAnsweredCount,
		totalQuestions: parcoursGameTotalQuestions,
		completed: parcoursGameCompleted,
	} = resolveParcoursGameState({
		stepState: persistedStepState,
		session: parcoursGameSession,
		questionCount: gameQuestionCount,
	});
	const shouldShowGameLoader =
		(isFinalizingGameStep || isLoadingParcoursGameSession) &&
		!parcoursGameCompleted &&
		(!optimisticGameQuestions || optimisticGameQuestions.length === 0);
	const isFinalGameTransition =
		isGameStep &&
		activeIndex === steps.length - 1 &&
		(isFinalizingGameStep ||
			Boolean(feedbackAnswer) ||
			parcoursGameCompleted ||
			completeDay.isPending);

	useEffect(() => {
		if (!isGameStep) {
			setOptimisticGameQuestions(null);
			return;
		}

		if (Array.isArray(parcoursGameSession?.questionsPool)) {
			setOptimisticGameQuestions(parcoursGameSession.questionsPool);
		}
	}, [isGameStep, parcoursGameSession?.questionsPool, parcoursGameSession?.sessionId]);

	useEffect(() => {
		specificVideoProgressRef.current = {
			stepId: currentStepId,
			checkpointMillis: specificVideoResumeMillis,
			positionMillis: specificVideoResumeMillis,
			durationMillis:
				typeof persistedStepState.videoDurationMillis === "number"
					? persistedStepState.videoDurationMillis
					: null,
			nextUnlocked: specificVideoNextUnlocked,
			completed: Boolean(persistedStepState.videoCompleted),
			rewatchedHalf: false,
			rewatchCountIncremented: false,
		};
	}, [
		currentStepId,
		persistedStepState.videoCompleted,
		persistedStepState.videoDurationMillis,
		specificVideoNextUnlocked,
		specificVideoResumeMillis,
	]);

	const canAdvance =
		Boolean(
			!feedbackAnswer &&
				!timeoutFeedbackLabel &&
				(day?.progression.isReadOnly ||
					((!requiresReveal || citationRevealed) &&
						(!isDicoStep || dicoAnswered || dicoHasSelection) &&
						(!isGameStep || parcoursGameCompleted) &&
						(!isTipsStep ||
							(isTipsQuestionPhase
								? tipsAnswered || tipsHasSelection
								: isTipsCardPhase)) &&
						(!requiresSpecificVideoWatch || specificVideoNextUnlocked)))
		);
	const timeoutCorrectAnswer =
		(isDicoStep
			? dicoAnswers.find((answer) => answer.key === dicoCorrectAnswerKey)
			: isTipsStep
				? tipsQuestionAnswers.find(
						(answer) => answer.key === tipsCorrectAnswerKey
				  )
				: null) || null;
	const timeoutAnswerLabel = timeoutCorrectAnswer
		? `La bonne réponse était ${timeoutCorrectAnswer.key.toUpperCase()} · ${timeoutCorrectAnswer.label}`
		: "La bonne réponse a été révélée.";

	const persistProgress = useCallback(async ({
		nextIndex,
		activeStepId,
		stepId,
		stepPatch,
	}: {
		nextIndex: number;
		activeStepId?: string | null;
		stepId?: string | null;
		stepPatch?: StepStateRecord;
	}) => {
		if (!day || !token || day.progression.isReadOnly) {
			return;
		}

		const nextPayload = mergeProgressPayload({
			basePayload: lastProgressPayloadRef.current,
			activeStepId,
			stepId,
			stepPatch,
		});

		lastProgressPayloadRef.current = nextPayload;
		setLastProgressPayload(nextPayload);

		const write = progressWriteQueueRef.current
			.catch(() => undefined)
			.then(() =>
				updateProgress.mutateAsync({
					dayId: day.id,
					token,
					payload: {
						currentStepIndex: nextIndex,
						lastProgressPayload: nextPayload,
					},
				})
			);
		progressWriteQueueRef.current = write.catch(() => undefined);
		await write;
	}, [day, token, updateProgress]);

	useEffect(() => {
		if (
			!isGameStep ||
			!day ||
			!token ||
			day.progression.isReadOnly ||
			!parcoursGameSessionId
		) {
			return;
		}

		const syncKey = `${currentStepId}:${parcoursGameSessionId}:${parcoursGameAnsweredCount}:${parcoursGameCompleted}`;
		if (gameSessionSyncKeyRef.current === syncKey) {
			return;
		}

		if (
			persistedStepState.gameSessionId === parcoursGameSessionId &&
			persistedStepState.gameAnsweredCount === parcoursGameAnsweredCount &&
			Boolean(persistedStepState.gameCompleted) === parcoursGameCompleted
		) {
			gameSessionSyncKeyRef.current = syncKey;
			return;
		}

		gameSessionSyncKeyRef.current = syncKey;
		void persistProgress({
			nextIndex: activeIndex,
			activeStepId: currentStepId,
			stepId: currentStepId,
			stepPatch: buildParcoursGameStepPatch({
				sessionId: parcoursGameSessionId,
				answeredCount: parcoursGameAnsweredCount,
				questionCount: parcoursGameTotalQuestions,
				completed: parcoursGameCompleted,
			}),
		});
	}, [
		activeIndex,
		currentStepId,
		day,
		isGameStep,
		parcoursGameAnsweredCount,
		parcoursGameCompleted,
		parcoursGameSessionId,
		parcoursGameTotalQuestions,
		persistProgress,
		persistedStepState.gameAnsweredCount,
		persistedStepState.gameCompleted,
		persistedStepState.gameSessionId,
		token,
	]);

	const finalizeDicoStep = async ({
		selectedAnswerKey,
		showFeedback,
	}: {
		selectedAnswerKey?: string | null;
		showFeedback: boolean;
	}) => {
		if (
			!day ||
			!dicoCorrectAnswerKey ||
			day.progression.isReadOnly ||
			dicoAnswerLocked ||
			dicoFinalizingRef.current
		) {
			return;
		}

		dicoFinalizingRef.current = true;

		try {
			const isCorrect = selectedAnswerKey === dicoCorrectAnswerKey;

			await persistProgress({
				nextIndex: activeIndex,
				activeStepId: currentStepId,
				stepId: currentStepId,
				stepPatch:
					showFeedback && selectedAnswerKey
						? buildValidatedParcoursDicoStepPatch({
								selectedAnswerKey,
								correctAnswerKey: dicoCorrectAnswerKey,
						  })
						: buildTimedOutParcoursDicoStepPatch({
								selectedAnswerKey,
								correctAnswerKey: dicoCorrectAnswerKey,
						  }),
			});

			setDraftAnswerByStepId((currentDraft) => {
				const nextDraft = { ...currentDraft };
				delete nextDraft[currentStepId];
				return nextDraft;
			});

			if (showFeedback && selectedAnswerKey) {
				pendingCorrectAdvanceRef.current = isCorrect;
				setFeedbackAnswer(isCorrect ? Answer.true : Answer.false);
			} else {
				setTimeoutFeedbackLabel(timeoutAnswerLabel);
			}
		} finally {
			dicoFinalizingRef.current = false;
		}
	};

	const finalizeTipsStep = async ({
		selectedAnswerKey,
		showFeedback,
	}: {
		selectedAnswerKey?: string | null;
		showFeedback: boolean;
	}) => {
		if (
			!day ||
			!tipsCorrectAnswerKey ||
			!tipsCurrentPair ||
			day.progression.isReadOnly ||
			tipsAnswerLocked ||
			tipsFinalizingRef.current
		) {
			return;
		}

		tipsFinalizingRef.current = true;

		try {
			const isCorrect = selectedAnswerKey === tipsCorrectAnswerKey;

			await persistProgress({
				nextIndex: activeIndex,
				activeStepId: currentStepId,
				stepId: currentStepId,
				stepPatch:
					showFeedback && selectedAnswerKey
						? buildValidatedParcoursTipsPairPatch({
								stepState: persistedStepState,
								pairIndex: tipsPairIndex,
								selectedAnswerKey,
								correctAnswerKey: tipsCorrectAnswerKey,
						  })
						: buildTimedOutParcoursTipsPairPatch({
								stepState: persistedStepState,
								pairIndex: tipsPairIndex,
								selectedAnswerKey,
								correctAnswerKey: tipsCorrectAnswerKey,
						  }),
			});

			setDraftAnswerByStepId((currentDraft) => {
				const nextDraft = { ...currentDraft };
				delete nextDraft[tipsPairDraftKey];
				return nextDraft;
			});

			if (showFeedback && selectedAnswerKey) {
				// The persisted phase now reveals the associated card after feedback.
				pendingCorrectAdvanceRef.current = false;
				setFeedbackAnswer(isCorrect ? Answer.true : Answer.false);
			} else {
				pendingCorrectAdvanceRef.current = false;
				setTimeoutFeedbackLabel(timeoutAnswerLabel);
			}
		} finally {
			tipsFinalizingRef.current = false;
		}
	};

	const handleCitationRevealComplete = async () => {
		if (citationRevealed || revealPersistedRef.current) {
			return;
		}

		revealPersistedRef.current = true;
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setLocallyRevealedStepId(currentStepId);
		await persistProgress({
			nextIndex: activeIndex,
			activeStepId: currentStepId,
			stepId: currentStepId,
			stepPatch: {
				citationRevealProgress: 1,
				citationRevealed: true,
			},
		});
	};

	const completeParcoursDayAndShowScreen = async () => {
		if (
			!day ||
			!token ||
			day.progression.isReadOnly ||
			completeDay.isPending ||
			isDayCompletionScreenVisible
		) {
			return;
		}

		await progressWriteQueueRef.current.catch(() => undefined);
		await completeDay.mutateAsync({
			dayId: day.id,
			token,
			payload: {
				currentStepIndex: activeIndex,
				lastProgressPayload: mergeProgressPayload({
					basePayload: lastProgressPayloadRef.current,
					activeStepId: currentStepId,
				}),
			},
		});
		void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		setIsDayCompletionScreenVisible(true);
	};

	const handleNext = async () => {
		if (!day || !canAdvance) return;

		if (isTipsStep) {
			if (isTipsQuestionPhase) {
				if (tipsAnswerLocked) {
					if (day.progression.isReadOnly) {
						setTipsReviewStateByStepId((currentState) => ({
							...currentState,
							[currentStepId]: {
								pairIndex: tipsPairIndex,
								phase: "card",
							},
						}));
						return;
					}

					await persistProgress({
						nextIndex: activeIndex,
						activeStepId: currentStepId,
						stepId: currentStepId,
						stepPatch: buildParcoursTipsPairPatch({
							stepState: persistedStepState,
							pairIndex: tipsPairIndex,
							phase: "card",
						}),
					});
					return;
				}

				if (!tipsDisplayedAnswerKey || !tipsCorrectAnswerKey) {
					return;
				}

				await finalizeTipsStep({
					selectedAnswerKey: tipsDisplayedAnswerKey,
					showFeedback: true,
				});

				return;
			}

			if (isTipsCardPhase && !tipsIsLastPair) {
				const nextPairIndex = tipsPairIndex + 1;
				if (day.progression.isReadOnly) {
					setTipsReviewStateByStepId((currentState) => ({
						...currentState,
						[currentStepId]: {
							pairIndex: nextPairIndex,
							phase: "question",
						},
					}));
					return;
				}

				await persistProgress({
					nextIndex: activeIndex,
					activeStepId: currentStepId,
					stepId: currentStepId,
					stepPatch: buildParcoursTipsPairPatch({
						stepState: persistedStepState,
						pairIndex: nextPairIndex,
						phase: "question",
					}),
				});
				return;
			}
		}

		if (isDicoStep && !dicoAnswerLocked) {
			if (!dicoDisplayedAnswerKey || !dicoCorrectAnswerKey) {
				return;
			}

			await finalizeDicoStep({
				selectedAnswerKey: dicoDisplayedAnswerKey,
				showFeedback: true,
			});

			return;
		}

		if (
			!isReviewMode &&
			isCitationStep &&
			citationRevealed &&
			isDicoQuestionParcoursStep(nextStep) &&
			!nextStepState.answered &&
			!seenDicoOnboardingStepIds[nextStepId]
		) {
			setPendingDicoOnboardingStepIndex(nextStepIndex);
			return;
		}

		if (
			!isReviewMode &&
			getParcoursOnboardingKind(nextStep) &&
			!(
				getParcoursOnboardingKind(nextStep) === "video" &&
				Boolean(nextStepState.videoCompleted)
			) &&
			!seenOnboardingStepIds[nextStepId]
		) {
			setPendingOnboardingStepIndex(nextStepIndex);
			return;
		}

		const isLastStep = activeIndex >= steps.length - 1;

		if (!isLastStep) {
			const nextIndex = activeIndex + 1;
			const nextStep = steps[nextIndex];
			const nextStepId = getParcoursStepId(nextStep, nextIndex);
			setActiveIndex(nextIndex);
			await persistProgress({
				nextIndex,
				activeStepId: nextStepId,
				stepId:
					requiresSpecificVideoWatch || isGameStep ? currentStepId : undefined,
				stepPatch: getCurrentTransientStepPatch(),
			});
			return;
		}

		if (day.progression.isReadOnly) {
			router.back();
			return;
		}

		await completeParcoursDayAndShowScreen();
	};

	const handleDicoOnboardingStart = async () => {
		if (!day || !dicoOnboardingStepId || dicoOnboardingStepIndex === null) {
			return;
		}

		setSeenDicoOnboardingStepIds((currentSeen) => ({
			...currentSeen,
			[dicoOnboardingStepId]: true,
		}));
		dicoOnboardingAdvancedStepIdsRef.current[dicoOnboardingStepId] = true;
		setPendingDicoOnboardingStepIndex(null);

		if (dicoOnboardingStepIndex === activeIndex) {
			return;
		}

		setActiveIndex(dicoOnboardingStepIndex);
		await persistProgress({
			nextIndex: dicoOnboardingStepIndex,
			activeStepId: dicoOnboardingStepId,
		});
	};

	const handleCitationOnboardingStart = () => {
		if (!currentStepId) {
			return;
		}

		setSeenOnboardingStepIds((currentSeen) => ({
			...currentSeen,
			[currentStepId]: true,
		}));
	};

	const handleStepOnboardingStart = async () => {
		if (
			!day ||
			pendingOnboardingStepIndex === null ||
			!pendingOnboardingStepId ||
			!pendingOnboardingKind
		) {
			return;
		}

		onboardingAdvancedStepIdsRef.current[pendingOnboardingStepId] = true;
		setSeenOnboardingStepIds((currentSeen) => ({
			...currentSeen,
			[pendingOnboardingStepId]: true,
		}));
		setPendingOnboardingStepIndex(null);
		setActiveIndex(pendingOnboardingStepIndex);
		await persistProgress({
			nextIndex: pendingOnboardingStepIndex,
			activeStepId: pendingOnboardingStepId,
		});
	};

	const handlePrevious = async () => {
		if (!day || activeIndex <= 0) return;

		if (isTipsStep) {
			if (isTipsCardPhase) {
				if (day.progression.isReadOnly) {
					setTipsReviewStateByStepId((currentState) => ({
						...currentState,
						[currentStepId]: {
							pairIndex: tipsPairIndex,
							phase: "question",
						},
					}));
					return;
				}

				await persistProgress({
					nextIndex: activeIndex,
					activeStepId: currentStepId,
					stepId: currentStepId,
					stepPatch: buildParcoursTipsPairPatch({
						stepState: persistedStepState,
						pairIndex: tipsPairIndex,
						phase: "question",
					}),
				});
				return;
			}

			if (isTipsQuestionPhase && tipsPairIndex > 0) {
				const previousPairIndex = tipsPairIndex - 1;
				if (day.progression.isReadOnly) {
					setTipsReviewStateByStepId((currentState) => ({
						...currentState,
						[currentStepId]: {
							pairIndex: previousPairIndex,
							phase: "card",
						},
					}));
					return;
				}

				await persistProgress({
					nextIndex: activeIndex,
					activeStepId: currentStepId,
					stepId: currentStepId,
					stepPatch: buildParcoursTipsPairPatch({
						stepState: persistedStepState,
						pairIndex: previousPairIndex,
						phase: "card",
					}),
				});
				return;
			}
		}

		const prevIndex = activeIndex - 1;
		const prevStep = steps[prevIndex];
		const prevStepId = getParcoursStepId(prevStep, prevIndex);
		setActiveIndex(prevIndex);
		await persistProgress({
			nextIndex: prevIndex,
			activeStepId: prevStepId,
			stepId:
				requiresSpecificVideoWatch || isGameStep ? currentStepId : undefined,
			stepPatch: getCurrentTransientStepPatch(),
		});
	};

	const handleQuit = async () => {
		if (day && !day.progression.isReadOnly) {
			await persistProgress({
				nextIndex: activeIndex,
				activeStepId: currentStepId,
				stepId:
					requiresSpecificVideoWatch || isGameStep ? currentStepId : undefined,
				stepPatch: getCurrentTransientStepPatch(),
			});
		}

		router.back();
	};

	const handleSelectDicoAnswer = (answerKey: string) => {
		if (day?.progression.isReadOnly || dicoAnswerLocked) {
			return;
		}

		setDraftAnswerByStepId((currentDraft) => ({
			...currentDraft,
			[currentStepId]: answerKey,
		}));
	};

	const handleSelectTipsAnswer = (answerKey: string) => {
		if (day?.progression.isReadOnly || tipsAnswerLocked) {
			return;
		}

		setDraftAnswerByStepId((currentDraft) => ({
			...currentDraft,
			[tipsPairDraftKey]: answerKey,
		}));
	};

	const getCurrentGameStepPatch = () => {
		if (!isGameStep || !parcoursGameSessionId) {
			return undefined;
		}

		return buildParcoursGameStepPatch({
			sessionId: parcoursGameSessionId,
			answeredCount: parcoursGameAnsweredCount,
			questionCount: parcoursGameTotalQuestions,
			completed: parcoursGameCompleted,
		});
	};

	const getCurrentTransientStepPatch = () =>
		getCurrentVideoStepPatch() ?? getCurrentGameStepPatch();

	const getCurrentVideoStepPatch = () => {
		if (!requiresSpecificVideoWatch || currentStepId !== specificVideoProgressRef.current.stepId) {
			return undefined;
		}

		const {
			positionMillis,
			durationMillis,
			completed,
			rewatchedHalf,
			rewatchCountIncremented,
		} =
			specificVideoProgressRef.current;
		const wasCompleted = Boolean(persistedStepState.videoCompleted);
		const persistedRewatchCount =
			typeof persistedStepState.videoRewatchCount === "number" &&
			Number.isFinite(persistedStepState.videoRewatchCount)
				? persistedStepState.videoRewatchCount
				: 0;

		if (!Number.isFinite(positionMillis) || positionMillis <= 0) {
			if (completed && !wasCompleted) {
				return buildParcoursVideoProgressPatch({
					positionMillis: durationMillis || 0,
					durationMillis,
					nextUnlocked: true,
					completed: true,
				});
			}

			return undefined;
		}

		if (wasCompleted) {
			if (!rewatchedHalf || rewatchCountIncremented) {
				return undefined;
			}

			specificVideoProgressRef.current = {
				...specificVideoProgressRef.current,
				rewatchCountIncremented: true,
			};

			return buildParcoursVideoProgressPatch({
				positionMillis,
				durationMillis,
				nextUnlocked: true,
				completed: true,
				rewatched: true,
				rewatchCount: persistedRewatchCount + 1,
			});
		}

		return buildParcoursVideoProgressPatch({
			positionMillis,
			durationMillis,
			nextUnlocked: completed ? true : false,
			completed,
		});
	};

	const handleSpecificVideoStatusUpdate = (status: CompatVideoStatus) => {
		if (
			!day ||
			day.progression.isReadOnly ||
			!requiresSpecificVideoWatch ||
			currentStepId !== specificVideoProgressRef.current.stepId ||
			!status.isLoaded
		) {
			return;
		}

		const previousState = specificVideoProgressRef.current;
		const checkpointMillis = previousState.checkpointMillis;
		const effectiveDurationMillis =
			typeof status.durationMillis === "number"
				? status.durationMillis
				: previousState.durationMillis;
		const nextUnlockedNow =
			status.didJustFinish ||
			hasParcoursVideoReachedNextThreshold({
				positionMillis: status.positionMillis,
				durationMillis: effectiveDurationMillis,
			});
		const nextCheckpointMillis = shouldPersistParcoursVideoCheckpoint({
			previousCheckpointMillis: checkpointMillis,
			nextPositionMillis: status.positionMillis,
		})
			? Math.max(checkpointMillis, getParcoursVideoCheckpoint(status.positionMillis))
			: checkpointMillis;
		const nextUnlocked = nextUnlockedNow || previousState.nextUnlocked;
		const completed = status.didJustFinish || previousState.completed;
		const alreadyCompleted =
			previousState.completed || Boolean(persistedStepState.videoCompleted);
		const rewatchedHalf =
			previousState.rewatchedHalf ||
			(Boolean(alreadyCompleted) &&
				typeof effectiveDurationMillis === "number" &&
				effectiveDurationMillis > 0 &&
				status.positionMillis >= effectiveDurationMillis / 2);

		specificVideoProgressRef.current = {
			...previousState,
			checkpointMillis: nextCheckpointMillis,
			positionMillis: status.positionMillis,
			durationMillis: effectiveDurationMillis,
			nextUnlocked,
			completed,
			rewatchedHalf,
			rewatchCountIncremented: previousState.rewatchCountIncremented,
		};

		if (nextUnlocked && !previousState.nextUnlocked) {
			setLocallyUnlockedVideoStepId(currentStepId);
		}

		const completionChanged =
			completed && !Boolean(persistedStepState.videoCompleted);
		if (
			completionChanged &&
			videoCompletionPersistedStepIdRef.current !== currentStepId
		) {
			videoCompletionPersistedStepIdRef.current = currentStepId;
			void persistProgress({
				nextIndex: activeIndex,
				activeStepId: currentStepId,
				stepId: currentStepId,
				stepPatch: buildParcoursVideoProgressPatch({
					positionMillis:
						typeof effectiveDurationMillis === "number"
							? effectiveDurationMillis
							: status.positionMillis,
					durationMillis: effectiveDurationMillis,
					nextUnlocked: true,
					completed: true,
				}),
			});
			return;
		}

		if (
			nextCheckpointMillis > checkpointMillis ||
			nextUnlocked !== previousState.nextUnlocked
		) {
			void persistProgress({
				nextIndex: activeIndex,
				activeStepId: currentStepId,
				stepId: currentStepId,
				stepPatch: buildParcoursVideoProgressPatch({
					positionMillis: status.positionMillis,
					durationMillis: effectiveDurationMillis,
					nextUnlocked,
					completed,
				}),
			});
		}
	};

	const handleGameSwipe = async (questionId: number, categorie: number, isRight: boolean) => {
		if (
			!auth?.user.id ||
			!parcoursGameSessionId ||
			!parcoursGameSession ||
			insertGameAnswer.isPending
		) {
			return;
		}

		const question = parcoursGameSession.questionsPool.find((item) => item.id === questionId);
		if (!question) {
			return;
		}
		const visibleGameQuestionCount =
			optimisticGameQuestions?.length ?? parcoursGameSession.questionsPool.length;
		const isLastGameQuestion = visibleGameQuestionCount <= 1;
		const gameFeedbackAnswer =
			question.attributes.ANSWER === isRight ? Answer.true : Answer.false;

		setOptimisticGameQuestions((currentQuestions) =>
			currentQuestions
				? currentQuestions.filter((item) => item.id !== questionId)
				: currentQuestions
		);
		setIsFinalizingGameStep(isLastGameQuestion);
		if (!isLastGameQuestion) {
			setFeedbackAnswer(gameFeedbackAnswer);
		}

		try {
			await insertGameAnswer.mutateAsync({
				gameId: parcoursGameSessionId,
				userId: auth.user.id,
				questionId,
				categorie,
				answer: isRight,
			});

			const refreshed = await refetchParcoursGameSession();
			const refreshedSession = refreshed.data?.data;
			if (!refreshedSession) {
				return;
			}

			await persistProgress({
				nextIndex: activeIndex,
				activeStepId: currentStepId,
				stepId: currentStepId,
				stepPatch: buildParcoursGameStepPatch({
					sessionId: refreshedSession.sessionId,
					answeredCount: refreshedSession.answeredCount,
					questionCount: gameQuestionCount,
					completed: refreshedSession.status === "finished",
				}),
			});

			if (
				isGameStep &&
				activeIndex === steps.length - 1 &&
				refreshedSession.status === "finished" &&
				!day?.progression.isReadOnly
			) {
				pendingDayCompletionRef.current = true;
			}
			if (isLastGameQuestion) {
				setFeedbackAnswer(gameFeedbackAnswer);
			}
		} catch {
			await refetchParcoursGameSession();
		} finally {
			setIsFinalizingGameStep(false);
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<View
			style={[
				styles.wrapper,
				{
					paddingTop: insets.top,
					backgroundColor: isDayCompletionScreenVisible
						? "#F7F7F7"
						: shouldShowCitationOnboarding
						? CITATION_ONBOARDING_BACKGROUND
						: shouldShowDicoOnboarding
							? DICO_ONBOARDING_BACKGROUND
							: getParcoursOnboardingBackground(pendingOnboardingKind) ||
							  colorWhite,
				},
			]}>
			<Stack.Screen options={{ headerShown: false, presentation: "card" }} />
			{hasNoReviewableSteps ? (
				<View style={styles.emptyReviewState}>
					<Text style={styles.emptyReviewTitle}>Aucune étape terminée</Text>
					<Text style={styles.emptyReviewBody}>
						Ce parcours est maintenant en lecture seule.
					</Text>
				</View>
			) : isDayCompletionScreenVisible ? (
				<ParcoursDayCompletionScreen
					dateLabel={dayDateLabel}
					weekProgramOrder={day?.week.programOrder}
					onReturn={() => {
						router.replace("/parcours");
					}}
				/>
			) : shouldShowCitationOnboarding ? (
				<ParcoursCitationOnboardingStep
					dateLabel={dayDateLabel}
					currentIndex={activeIndex}
					totalSteps={totalSteps}
					onStart={handleCitationOnboardingStart}
				/>
			) : shouldShowDicoOnboarding ? (
				<ParcoursDicoOnboardingStep
					dateLabel={dayDateLabel}
					currentIndex={dicoOnboardingStepIndex ?? nextStepIndex}
					totalSteps={totalSteps}
					onStart={() => {
						void handleDicoOnboardingStart();
					}}
				/>
			) : shouldShowStepOnboarding && pendingOnboardingKind === "tips" ? (
				<ParcoursTipsOnboardingStep
					dateLabel={dayDateLabel}
					currentIndex={pendingOnboardingStepIndex ?? activeIndex}
					totalSteps={totalSteps}
					onStart={() => {
						void handleStepOnboardingStart();
					}}
				/>
			) : shouldShowStepOnboarding && pendingOnboardingKind === "video" ? (
				<ParcoursVideoOnboardingStep
					dateLabel={dayDateLabel}
					currentIndex={pendingOnboardingStepIndex ?? activeIndex}
					totalSteps={totalSteps}
					onStart={() => {
						void handleStepOnboardingStart();
					}}
				/>
			) : shouldShowStepOnboarding && pendingOnboardingKind === "game" ? (
				<ParcoursGameOnboardingStep
					dateLabel={dayDateLabel}
					currentIndex={pendingOnboardingStepIndex ?? activeIndex}
					totalSteps={totalSteps}
					onStart={() => {
						void handleStepOnboardingStart();
					}}
				/>
			) : isCitationStep ? (
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingBottom: insets.bottom + 110,
						paddingTop: 2,
						flexGrow: 1,
					}}
					scrollEnabled={citationRevealed && !isScratchGestureActive}
					showsVerticalScrollIndicator={false}>
					<ParcoursDayHeader
						dateLabel={dayDateLabel}
						currentIndex={activeIndex}
						totalSteps={totalSteps}
						accentColor={currentAccentColor}
					/>

					<View style={[styles.stepStage, styles.stepStageCentered]}>
						<ParcoursCitationRevealCard
							id={currentStepId}
							theme={String(currentStepContent.theme || "Citation")}
							text={String(currentStepContent.text || "")}
							author={String(currentStepContent.author || "")}
							revealed={citationRevealed}
							accentColor={currentAccentColor}
							onScratchStart={() => {
								setIsScratchGestureActive(true);
							}}
							onScratchEnd={() => {
								setIsScratchGestureActive(false);
							}}
							onRevealComplete={() => {
								setIsScratchGestureActive(false);
								void handleCitationRevealComplete();
							}}
						/>
					</View>
				</ScrollView>
			) : (
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingBottom: insets.bottom + 88,
						paddingTop: 2,
						flexGrow: 1,
					}}
					scrollEnabled={!isGameStep || isCompletedReview}
					showsVerticalScrollIndicator={false}>
					<ParcoursDayHeader
						dateLabel={dayDateLabel}
						currentIndex={activeIndex}
						totalSteps={totalSteps}
						accentColor={currentAccentColor}
						trailing={
							(isDicoStep && !dicoAnswerLocked) ||
							(isTipsQuestionPhase && !tipsAnswerLocked) ? (
								<ParcoursStepTimer
									key={
										isTipsQuestionPhase
											? `${currentStepId}:${tipsPairIndex}`
											: currentStepId
									}
									accentColor={currentAccentColor}
									durationSeconds={15}
									onComplete={() => {
										if (isTipsQuestionPhase) {
											void finalizeTipsStep({
												selectedAnswerKey: tipsDisplayedAnswerKey,
												showFeedback: false,
											});
											return;
										}

										void finalizeDicoStep({
											selectedAnswerKey: dicoDisplayedAnswerKey,
											showFeedback: false,
										});
									}}
								/>
							) : undefined
						}
					/>

					<View
						style={[
							styles.stepStage,
							isGameStep && !isCompletedReview && styles.stepStageCentered,
							isTipsCardPhase && styles.stepStageCentered,
						]}>
						{isDicoStep ? (
							<ParcoursDicoQuestionStep
								word={String(currentStepContent.word || "")}
								definition={
									currentStepContent.definition
										? String(currentStepContent.definition)
										: null
								}
								answers={dicoAnswers}
								selectedAnswerKey={dicoDisplayedAnswerKey}
								submittedAnswerKey={dicoSubmittedAnswerKey}
								correctAnswerKey={dicoPersistedCorrectAnswerKey}
								answerWasCorrect={dicoAnswerWasCorrect}
								onSelectAnswer={(answerKey) => {
									handleSelectDicoAnswer(answerKey);
								}}
								accentColor={currentAccentColor}
								disabled={Boolean(day?.progression.isReadOnly)}
								locked={dicoAnswerLocked}
							/>
						) : isTipsStep && tipsCurrentPair ? (
							isTipsQuestionPhase ? (
								<ParcoursDicoQuestionStep
									stepLabel='Tips & Tactics'
									word={String(tipsCurrentPair.question || "")}
									definition={null}
									answers={tipsQuestionAnswers}
									selectedAnswerKey={tipsDisplayedAnswerKey}
									submittedAnswerKey={tipsSubmittedAnswerKey}
									correctAnswerKey={tipsPersistedCorrectAnswerKey}
									answerWasCorrect={tipsAnswerWasCorrect}
									onSelectAnswer={(answerKey) => {
										handleSelectTipsAnswer(answerKey);
									}}
									accentColor={currentAccentColor}
									disabled={Boolean(day?.progression.isReadOnly)}
									locked={tipsAnswerLocked}
								/>
							) : (
								<CommandementCard
									title={String(tipsCurrentPair.card?.title || "Tips & Tactics")}
									text={String(tipsCurrentPair.card?.text || "")}
									cardWidth={commandementCardWidth}
									cardMargin={0}
									cta={String(tipsCurrentPair.card?.cta || "")}
									index={tipsPairIndex + 1}
								/>
							)
						) : isGameStep ? (
							isCompletedReview ? (
								isLoadingCompletedGameResults ? (
									<Loader />
								) : (
									<ParcoursGameAnswersReview
										answers={completedGameResults?.data.allQuestions || []}
									/>
								)
							) : shouldShowGameLoader && !isFinalGameTransition ? (
								<Loader />
							) : (
								<ParcoursGameQuestionStep
									questions={optimisticGameQuestions || []}
									completed={parcoursGameCompleted}
									hideStateMessage={
										isFinalGameTransition ||
										isFinalizingGameStep ||
										Boolean(feedbackAnswer)
									}
									onSwipe={(question, isRight) => {
										void handleGameSwipe(
											question.id,
											question.attributes.CATEGORIE,
											isRight
										);
									}}
								/>
							)
						) : requiresSpecificVideoWatch &&
						  (currentStepContent.rubriqueType === "thirty_seconds" ||
								currentStepContent.rubriqueType === "top_deflop") &&
						  specificVideoUri ? (
							<ParcoursSpecificRubriqueVideoStep
								videoUri={specificVideoUri}
								accentColor={currentAccentColor}
								initialPositionMillis={specificVideoResumeMillis}
								completed={Boolean(persistedStepState.videoCompleted)}
								onPlaybackStatusUpdate={handleSpecificVideoStatusUpdate}
							/>
						) : (
							<StepFallback step={currentStep || {}} />
						)}
					</View>
				</ScrollView>
			)}

			{isDayCompletionScreenVisible ||
			shouldShowCitationOnboarding ||
			shouldShowDicoOnboarding ||
			shouldShowStepOnboarding ? null : (
				<ParcoursFloatingNav
					canAdvance={Boolean(canAdvance)}
					isCompleting={
						completeDay.isPending ||
						updateProgress.isPending ||
						Boolean(feedbackAnswer) ||
						Boolean(timeoutFeedbackLabel)
					}
					isFirstStep={activeIndex === 0}
					onQuit={() => {
						void handleQuit();
					}}
					onBack={() => {
						void handlePrevious();
					}}
					onNext={() => {
						void handleNext();
					}}
					nextLabel={
						hasNoReviewableSteps
							? "Retour"
							: activeIndex < steps.length - 1
								? "Suivant"
								: "Terminer"
					}
					bottomOffset={Math.max(insets.bottom, 14)}
					accentColor={currentAccentColor}
				/>
			)}
			{feedbackAnswer ? (
				<FeedbackMessage
					answer={feedbackAnswer}
					durationMs={1500}
					isHomeButtonModel
					onHide={() => {
						const shouldAdvance = pendingCorrectAdvanceRef.current;
						const shouldShowCompletionScreen =
							pendingDayCompletionRef.current;
						pendingCorrectAdvanceRef.current = false;
						pendingDayCompletionRef.current = false;
						setFeedbackAnswer(null);
						if (shouldShowCompletionScreen) {
							void completeParcoursDayAndShowScreen();
							return;
						}
						if (shouldAdvance) {
							void handleNext();
						}
					}}
				/>
			) : null}
			{timeoutFeedbackLabel ? (
				<ParcoursTimeoutFeedback
					answerLabel={timeoutFeedbackLabel}
					onHide={() => {
						setTimeoutFeedbackLabel(null);
					}}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colorWhite,
	},
	fallbackCard: {
		backgroundColor: colorWhite,
		borderRadius: 24,
		padding: 20,
	},
	fallbackType: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorDarkGrey,
		marginBottom: 8,
		textTransform: "capitalize",
	},
	fallbackBody: {
		fontSize: FontSize16,
		lineHeight: 22,
		fontWeight: "600",
		color: colorBlack,
	},
	stepStage: {
		flex: 1,
	},
	stepStageCentered: {
		justifyContent: "center",
		paddingBottom: 32,
	},
	emptyReviewState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	emptyReviewTitle: {
		fontSize: FontSize16,
		fontWeight: "900",
		color: colorBlack,
		textAlign: "center",
		marginBottom: 8,
	},
	emptyReviewBody: {
		fontSize: FontSize14,
		fontWeight: "600",
		color: colorDarkGrey,
		textAlign: "center",
	},
});
