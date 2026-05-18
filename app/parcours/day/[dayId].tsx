import {
	useCompleteParcoursDay,
	useParcoursDay,
	useStartParcoursDay,
	useUpdateParcoursDayProgress,
} from "@/api/parcours/useParcours";
import CommandementCard from "@/components/cards/CommandementCard";
import ParcoursCitationRevealCard from "@/components/parcours/ParcoursCitationRevealCard";
import ParcoursDayHeader from "@/components/parcours/ParcoursDayHeader";
import ParcoursDicoQuestionStep from "@/components/parcours/ParcoursDicoQuestionStep";
import ParcoursSpecificRubriqueVideoStep from "@/components/parcours/ParcoursSpecificRubriqueVideoStep";
import Loader from "@/components/experience/loader";
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
import {
	buildTimedOutParcoursDicoStepPatch,
	buildValidatedParcoursDicoStepPatch,
	getParcoursDicoAnswers,
	resolveParcoursDicoState,
} from "@/helpers/parcours/dico";
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
import {
	getStepState,
	mergeProgressPayload,
	resolveInitialParcoursStepIndex,
	StepStateRecord,
} from "@/helpers/parcours/progress";
import {
	getParcoursStepId,
	isCitationParcoursStep,
	isDicoQuestionParcoursStep,
	isSpecificRubriqueParcoursStep,
	isTipsAndTacticsParcoursStep,
	toParcoursDayStep,
} from "@/helpers/parcours/steps";
import useJwtToken from "@/hooks/useJwtToken";
import { Answer } from "@/types/enums";
import { CompatVideoStatus } from "@/components/media/ExpoVideo";
import {
	ParcoursDayStep,
} from "@/types/parcours";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

export default function ParcoursDayScreen() {
	const insets = useSafeAreaInsets();
	const { width: screenWidth } = useWindowDimensions();
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
	const hasStartedRef = useRef(false);
	const revealPersistedRef = useRef(false);
	const day = data?.data;

	const steps = useMemo(
		() =>
			Array.isArray(day?.stepsPayload?.steps)
				? day.stepsPayload.steps.map(toParcoursDayStep)
				: [],
		[day?.stepsPayload?.steps]
	);
	const totalSteps = day?.stepsPayload?.dayMeta?.totalSteps || steps.length;
	const initialIndex = useMemo(
		() =>
			resolveInitialParcoursStepIndex({
				steps,
				currentStepIndex: day?.progression?.currentStepIndex,
				lastProgressPayload: day?.progression?.lastProgressPayload,
				getStepId: getParcoursStepId,
			}),
		[day?.progression?.currentStepIndex, day?.progression?.lastProgressPayload, steps]
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
	const [locallyUnlockedVideoStepId, setLocallyUnlockedVideoStepId] = useState<string | null>(
		null
	);
	const lastProgressPayloadRef = useRef<Record<string, unknown> | null>(
		day?.progression?.lastProgressPayload || null
	);
	const pendingCorrectAdvanceRef = useRef(false);
	const dicoFinalizingRef = useRef(false);
	const tipsFinalizingRef = useRef(false);
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
		setLastProgressPayload(day?.progression?.lastProgressPayload || null);
		lastProgressPayloadRef.current = day?.progression?.lastProgressPayload || null;
	}, [day?.progression?.lastProgressPayload]);

	useEffect(() => {
		setLocallyRevealedStepId(null);
		revealPersistedRef.current = false;
		setDraftAnswerByStepId({});
		setFeedbackAnswer(null);
		setTimeoutFeedbackLabel(null);
		setLocallyUnlockedVideoStepId(null);
		pendingCorrectAdvanceRef.current = false;
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
	const dayDateLabel = formatParcoursDayDate(
		day?.availableFrom,
		day?.stepsPayload?.dayMeta?.dateLabel
	);

	const isCitationStep = isCitationParcoursStep(currentStep);
	const isDicoStep = isDicoQuestionParcoursStep(currentStep);
	const isSpecificRubriqueStep = isSpecificRubriqueParcoursStep(currentStep);
	const isTipsStep = isTipsAndTacticsParcoursStep(currentStep);
	const citationRevealed =
		Boolean(persistedStepState.citationRevealed) ||
		locallyRevealedStepId === currentStepId;

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
	const tipsDraftKey = `${currentStepId}:${
		typeof persistedStepState.tipsPairIndex === "number"
			? persistedStepState.tipsPairIndex
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
		stepState: persistedStepState,
		draftAnswerKey: draftAnswerByStepId[tipsDraftKey],
		isReadOnly: day?.progression.isReadOnly,
	});
	const tipsPairDraftKey = `${currentStepId}:${tipsPairIndex}`;
	const tipsQuestionAnswers = tipsCurrentPair?.answers || [];
	const isTipsQuestionPhase = isTipsStep && tipsPhase === "question";
	const isTipsCardPhase = isTipsStep && tipsPhase === "card";
	const commandementCardWidth = Math.min(Math.max(screenWidth - 48, 280), 360);
	const requiresReveal = isCitationStep && currentStep?.stateMode === "reveal_once";
	const specificVideoUri = resolveParcoursVideoUri(currentStepContent);
	const specificVideoNextUnlocked =
		getParcoursVideoNextUnlocked(persistedStepState) ||
		locallyUnlockedVideoStepId === currentStepId;
	const specificVideoResumeMillis =
		Boolean(persistedStepState.videoCompleted)
			? 0
			: typeof persistedStepState.videoCheckpointMillis === "number"
			? persistedStepState.videoCheckpointMillis
			: 0;
	const requiresSpecificVideoWatch =
		isSpecificRubriqueStep &&
		(currentStepContent.rubriqueType === "thirty_seconds" ||
			currentStepContent.rubriqueType === "top_deflop") &&
		Boolean(specificVideoUri);

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

	const persistProgress = async ({
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

		await updateProgress.mutateAsync({
			dayId: day.id,
			token,
			payload: {
				currentStepIndex: nextIndex,
				lastProgressPayload: nextPayload,
			},
		});
	};

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

			pendingCorrectAdvanceRef.current = false;
			if (showFeedback && selectedAnswerKey) {
				setFeedbackAnswer(isCorrect ? Answer.true : Answer.false);
			} else {
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

	const handleNext = async () => {
		if (!day || !canAdvance) return;

		if (isTipsStep) {
			if (isTipsQuestionPhase) {
				if (tipsAnswerLocked) {
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

		const isLastStep = activeIndex >= steps.length - 1;

		if (!isLastStep) {
			const nextIndex = activeIndex + 1;
			const nextStep = steps[nextIndex];
			const nextStepId = getParcoursStepId(nextStep, nextIndex);
			setActiveIndex(nextIndex);
			await persistProgress({
				nextIndex,
				activeStepId: nextStepId,
				stepId: requiresSpecificVideoWatch ? currentStepId : undefined,
				stepPatch: getCurrentVideoStepPatch(),
			});
			return;
		}

		if (!token || day.progression.isReadOnly) return;

		await completeDay.mutateAsync({
			dayId: day.id,
			token,
			payload: {
				currentStepIndex: activeIndex,
				lastProgressPayload: mergeProgressPayload({
					basePayload: lastProgressPayload,
					activeStepId: currentStepId,
				}),
			},
		});
		router.back();
	};

	const handlePrevious = async () => {
		if (!day || activeIndex <= 0) return;

		const prevIndex = activeIndex - 1;
		const prevStep = steps[prevIndex];
		const prevStepId = getParcoursStepId(prevStep, prevIndex);
		setActiveIndex(prevIndex);
		await persistProgress({
			nextIndex: prevIndex,
			activeStepId: prevStepId,
			stepId: requiresSpecificVideoWatch ? currentStepId : undefined,
			stepPatch: getCurrentVideoStepPatch(),
		});
	};

	const handleQuit = async () => {
		if (day && !day.progression.isReadOnly) {
			await persistProgress({
				nextIndex: activeIndex,
				activeStepId: currentStepId,
				stepId: requiresSpecificVideoWatch ? currentStepId : undefined,
				stepPatch: getCurrentVideoStepPatch(),
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

		const checkpointMillis = specificVideoProgressRef.current.checkpointMillis;
		const nextUnlockedNow =
			status.didJustFinish ||
			hasParcoursVideoReachedNextThreshold({
				positionMillis: status.positionMillis,
				durationMillis: status.durationMillis,
			});

		if (nextUnlockedNow && !specificVideoProgressRef.current.nextUnlocked) {
			setLocallyUnlockedVideoStepId(currentStepId);
			specificVideoProgressRef.current = {
				...specificVideoProgressRef.current,
				checkpointMillis: getParcoursVideoCheckpoint(status.positionMillis),
				positionMillis: status.positionMillis,
				durationMillis: status.durationMillis,
				nextUnlocked: true,
				completed: status.didJustFinish,
			};
			return;
		}

		const nextCheckpointMillis = shouldPersistParcoursVideoCheckpoint({
			previousCheckpointMillis: checkpointMillis,
			nextPositionMillis: status.positionMillis,
		})
			? Math.max(checkpointMillis, getParcoursVideoCheckpoint(status.positionMillis))
			: checkpointMillis;
		const previousState = specificVideoProgressRef.current;
		const effectiveDurationMillis =
			typeof status.durationMillis === "number"
				? status.durationMillis
				: previousState.durationMillis;
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
			nextUnlocked: previousState.nextUnlocked,
			completed: status.didJustFinish || previousState.completed,
			rewatchedHalf,
			rewatchCountIncremented: previousState.rewatchCountIncremented,
		};
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<Stack.Screen options={{ headerShown: false, presentation: "card" }} />
			{isCitationStep ? (
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
									durationSeconds={30}
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
						) : requiresSpecificVideoWatch &&
						  (currentStepContent.rubriqueType === "thirty_seconds" ||
								currentStepContent.rubriqueType === "top_deflop") &&
						  specificVideoUri ? (
							<ParcoursSpecificRubriqueVideoStep
								videoUri={specificVideoUri}
								accentColor={currentAccentColor}
								initialPositionMillis={specificVideoResumeMillis}
								onPlaybackStatusUpdate={handleSpecificVideoStatusUpdate}
							/>
						) : (
							<StepFallback step={currentStep || {}} />
						)}
					</View>
				</ScrollView>
			)}

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
				nextLabel={activeIndex < steps.length - 1 ? "Suivant" : "Terminer"}
				bottomOffset={Math.max(insets.bottom, 14)}
				accentColor={currentAccentColor}
			/>
			{feedbackAnswer ? (
				<FeedbackMessage
					answer={feedbackAnswer}
					durationMs={2000}
					isHomeButtonModel
					onHide={() => {
						const shouldAdvance = pendingCorrectAdvanceRef.current;
						pendingCorrectAdvanceRef.current = false;
						setFeedbackAnswer(null);
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
});
