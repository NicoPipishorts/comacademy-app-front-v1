import {
	useCompleteParcoursDay,
	useParcoursDay,
	useStartParcoursDay,
	useUpdateParcoursDayProgress,
} from "@/api/parcours/useParcours";
import ParcoursCitationRevealCard from "@/components/parcours/ParcoursCitationRevealCard";
import ParcoursDicoQuestionStep from "@/components/parcours/ParcoursDicoQuestionStep";
import Loader from "@/components/experience/loader";
import ParcoursFloatingNav from "@/components/parcours/ParcoursFloatingNav";
import ParcoursStepCounter from "@/components/parcours/ParcoursStepCounter";
import ParcoursStepTimer from "@/components/parcours/ParcoursStepTimer";
import {
	colorBlack,
	colorDarkGrey,
	primaryBackground,
	colorWhite,
} from "@/constants/colors";
import {
	FontSize14,
	FontSize16,
	FontSize18,
} from "@/constants/fontsizes";
import {
	formatParcoursDayDate,
	resolveParcoursAccentColor,
} from "@/helpers/parcours/theme";
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
	toParcoursDayStep,
} from "@/helpers/parcours/steps";
import useJwtToken from "@/hooks/useJwtToken";
import { Answer } from "@/types/enums";
import {
	ParcoursDayStep,
	ParcoursDicoAnswerOption,
} from "@/types/parcours";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import FeedbackMessage from "../../(tabs)/leJeu/feedbackMessage";
import {
	ScrollView,
	StyleSheet,
	Text,
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
	const lastProgressPayloadRef = useRef<Record<string, unknown> | null>(
		day?.progression?.lastProgressPayload || null
	);
	const pendingCorrectAdvanceRef = useRef(false);

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

	const isCitationStep = isCitationParcoursStep(currentStep);
	const isDicoStep = isDicoQuestionParcoursStep(currentStep);
	const citationRevealed =
		Boolean(persistedStepState.citationRevealed) ||
		locallyRevealedStepId === currentStepId;

	if (isLoading) {
		return <Loader />;
	}

	const dicoAnswered = Boolean(persistedStepState.answered);
	const dicoAnswers = Array.isArray(currentStepContent.answers)
		? (currentStepContent.answers as ParcoursDicoAnswerOption[]).filter(
				(answer) =>
					answer &&
					typeof answer.key === "string" &&
					typeof answer.label === "string"
		  )
		: [];
	const dicoCorrectAnswerKey =
		typeof currentStepContent.correctAnswerKey === "string"
			? currentStepContent.correctAnswerKey
			: null;
	const dicoDisplayedAnswerKey =
		typeof persistedStepState.selectedAnswerKey === "string"
			? persistedStepState.selectedAnswerKey
			: draftAnswerByStepId[currentStepId] || null;
	const dicoSubmittedAnswerKey =
		typeof persistedStepState.answerSubmittedKey === "string"
			? persistedStepState.answerSubmittedKey
			: null;
	const dicoAnswerLocked =
		Boolean(day?.progression.isReadOnly) || Boolean(persistedStepState.answerLocked || dicoAnswered);
	const dicoHasSelection = Boolean(dicoDisplayedAnswerKey);
	const requiresReveal = isCitationStep && currentStep?.stateMode === "reveal_once";
	const canAdvance =
		Boolean(
			!feedbackAnswer &&
				(day?.progression.isReadOnly ||
					((!requiresReveal || citationRevealed) &&
						(!isDicoStep || dicoAnswered || dicoHasSelection)))
		);

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

		if (isDicoStep && !dicoAnswerLocked) {
			if (!dicoDisplayedAnswerKey || !dicoCorrectAnswerKey) {
				return;
			}

			const isCorrect = dicoDisplayedAnswerKey === dicoCorrectAnswerKey;

			await persistProgress({
				nextIndex: activeIndex,
				activeStepId: currentStepId,
				stepId: currentStepId,
				stepPatch: {
					selectedAnswerKey: isCorrect ? dicoDisplayedAnswerKey : dicoCorrectAnswerKey,
					answerSubmittedKey: dicoDisplayedAnswerKey,
					correctAnswerKey: dicoCorrectAnswerKey,
					answerWasCorrect: isCorrect,
					answerLocked: true,
					answered: true,
				},
			});

			setDraftAnswerByStepId((currentDraft) => {
				const nextDraft = { ...currentDraft };
				delete nextDraft[currentStepId];
				return nextDraft;
			});

			pendingCorrectAdvanceRef.current = isCorrect;
			setFeedbackAnswer(isCorrect ? Answer.true : Answer.false);

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
		});
	};

	const handleSelectDicoAnswer = async (answerKey: string) => {
		if (day?.progression.isReadOnly || dicoAnswerLocked) {
			return;
		}

		setDraftAnswerByStepId((currentDraft) => ({
			...currentDraft,
			[currentStepId]: answerKey,
		}));
	};

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
					<View style={styles.topMeta}>
						<Text style={styles.dateLabel}>
							{formatParcoursDayDate(
								day?.availableFrom,
								day?.stepsPayload?.dayMeta?.dateLabel
							)}
						</Text>
						<ParcoursStepCounter
							currentIndex={activeIndex}
							totalSteps={totalSteps}
							accentColor={currentAccentColor}
						/>
					</View>

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
						paddingTop: 18,
						flexGrow: 1,
					}}
					showsVerticalScrollIndicator={false}>
					<View style={styles.topMeta}>
						<View style={styles.headerRow}>
							<Text style={styles.dateLabel}>
								{formatParcoursDayDate(
									day?.availableFrom,
									day?.stepsPayload?.dayMeta?.dateLabel
								)}
							</Text>
							{isDicoStep && !dicoAnswerLocked ? (
								<ParcoursStepTimer
									key={currentStepId}
									accentColor={currentAccentColor}
									durationSeconds={30}
								/>
							) : null}
						</View>
						<ParcoursStepCounter
							currentIndex={activeIndex}
							totalSteps={totalSteps}
							accentColor={currentAccentColor}
						/>
					</View>

					<View style={styles.stepStage}>
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
								correctAnswerKey={
									typeof persistedStepState.correctAnswerKey === "string"
										? persistedStepState.correctAnswerKey
										: dicoCorrectAnswerKey
								}
								answerWasCorrect={
									typeof persistedStepState.answerWasCorrect === "boolean"
										? persistedStepState.answerWasCorrect
										: undefined
								}
								onSelectAnswer={(answerKey) => {
									void handleSelectDicoAnswer(answerKey);
								}}
								accentColor={currentAccentColor}
								disabled={Boolean(day?.progression.isReadOnly)}
								locked={dicoAnswerLocked}
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
					Boolean(feedbackAnswer)
				}
				isFirstStep={activeIndex === 0}
				onQuit={() => router.back()}
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
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colorWhite,
	},
	dateLabel: {
		fontSize: FontSize18,
		fontWeight: "800",
		color: colorBlack,
	},
	topMeta: {
		paddingTop: 2,
		marginBottom: 18,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: 16,
		marginBottom: 14,
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
		paddingTop: 100,
		justifyContent: "flex-start",
	},
});
