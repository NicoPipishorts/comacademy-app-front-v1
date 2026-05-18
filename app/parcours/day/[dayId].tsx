import {
	useCompleteParcoursDay,
	useParcoursDay,
	useStartParcoursDay,
	useUpdateParcoursDayProgress,
} from "@/api/parcours/useParcours";
import ParcoursCitationRevealCard from "@/components/parcours/ParcoursCitationRevealCard";
import ParcoursDicoQuestionStep from "@/components/parcours/ParcoursDicoQuestionStep";
import Loader from "@/components/experience/loader";
import {
	colorBlack,
	colorDarkGrey,
	colorPink,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import {
	FontSize14,
	FontSize16,
	FontSize18,
	FontSizeH1,
} from "@/constants/fontsizes";
import useJwtToken from "@/hooks/useJwtToken";
import {
	ParcoursDayStep,
	ParcoursDicoAnswerOption,
	ParcoursDicoQuestionStep as ParcoursDicoQuestionStepRecord,
} from "@/types/parcours";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StepStateRecord = {
	citationRevealProgress?: number;
	citationRevealed?: boolean;
	selectedAnswerKey?: string;
	answered?: boolean;
};

type ProgressPayload = {
	activeStepId?: string | null;
	stepState?: Record<string, StepStateRecord>;
	[key: string]: unknown;
};

const toStepRecord = (value: unknown): ParcoursDayStep =>
	value && typeof value === "object" ? (value as ParcoursDayStep) : {};

const isCitationStepRecord = (
	step: ParcoursDayStep | null | undefined
): step is Extract<ParcoursDayStep, { type: "citation" }> => step?.type === "citation";

const isDicoQuestionStepRecord = (
	step: ParcoursDayStep | null | undefined
): step is ParcoursDicoQuestionStepRecord => step?.type === "dico_question";

const capitalize = (value: string) =>
	value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const normalizeThemeColor = (value?: string | null) => {
	const raw = String(value || "").trim();
	if (!raw) {
		return null;
	}

	if (raw.startsWith("#")) {
		return raw;
	}

	if (/^[0-9A-Fa-f]{6}$/u.test(raw) || /^[0-9A-Fa-f]{3}$/u.test(raw)) {
		return `#${raw}`;
	}

	return raw;
};

const formatDayDate = (value?: string | null, fallback?: string | null) => {
	if (fallback && fallback.trim().length > 0) {
		return fallback;
	}

	if (!value) {
		return "Jour du parcours";
	}

	try {
		return capitalize(format(new Date(value), "EEEE d MMMM yyyy", { locale: fr }));
	} catch {
		return "Jour du parcours";
	}
};

const getProgressPayload = (
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

const getStepState = (
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

const getActiveStepId = (
	payload: Record<string, unknown> | string | null | undefined
) => {
	const progressPayload = getProgressPayload(payload);
	return typeof progressPayload.activeStepId === "string"
		? progressPayload.activeStepId
		: null;
};

const mergeProgressPayload = ({
	basePayload,
	activeStepId,
	stepId,
	stepPatch,
}: {
	basePayload: Record<string, unknown> | null | undefined;
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

function StepCounter({
	currentIndex,
	totalSteps,
	accentColor,
}: {
	currentIndex: number;
	totalSteps: number;
	accentColor: string;
}) {
	const safeTotal = Math.max(totalSteps, 1);
	const safeCurrent = Math.min(currentIndex + 1, safeTotal);

	return (
		<View style={styles.counterBlock}>
			<Text style={styles.counterText}>
				{safeCurrent}/{safeTotal}
			</Text>
			<View style={styles.counterTrack}>
				<View
					style={[
						styles.counterFill,
						{ backgroundColor: accentColor },
						{ width: `${(safeCurrent / safeTotal) * 100}%` },
					]}
				/>
			</View>
		</View>
	);
}

function FloatingNav({
	canAdvance,
	isCompleting,
	isFirstStep,
	onQuit,
	onBack,
	onNext,
	nextLabel,
	bottomOffset,
	accentColor,
}: {
	canAdvance: boolean;
	isCompleting: boolean;
	isFirstStep: boolean;
	onQuit: () => void;
	onBack: () => void;
	onNext: () => void;
	nextLabel: string;
	bottomOffset: number;
	accentColor: string;
}) {
	return (
		<View pointerEvents='box-none' style={[styles.floatingNav, { bottom: bottomOffset }]}>
			<Pressable onPress={isFirstStep ? onQuit : onBack} style={styles.quitButton}>
				<View style={styles.quitIconWrap}>
					<Ionicons name='arrow-back' size={18} color={colorWhite} />
				</View>
				<Text style={styles.quitLabel}>{isFirstStep ? "Quitter" : "Retour"}</Text>
			</Pressable>
			<Pressable
				disabled={!canAdvance || isCompleting}
				onPress={onNext}
				style={[
					styles.nextButton,
					{ backgroundColor: accentColor },
					(!canAdvance || isCompleting) && styles.nextButtonDisabled,
				]}>
				<View style={styles.nextIconWrap}>
					<Ionicons name='arrow-forward' size={18} color={accentColor} />
				</View>
				<Text style={styles.nextLabel}>{nextLabel}</Text>
			</Pressable>
		</View>
	);
}

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
		() => (Array.isArray(day?.stepsPayload?.steps) ? day?.stepsPayload?.steps.map(toStepRecord) : []),
		[day?.stepsPayload?.steps]
	);
	const totalSteps = day?.stepsPayload?.dayMeta?.totalSteps || steps.length;
	const initialIndex = useMemo(() => {
		const progressPayload = day?.progression?.lastProgressPayload;
		const activeStepId = getActiveStepId(progressPayload);
		if (activeStepId) {
			const activeStepIndex = steps.findIndex((step, index) => {
				const stepId =
					typeof step?.id === "string" ? step.id : `step_${index}`;
				return stepId === activeStepId;
			});

			if (activeStepIndex >= 0) {
				return activeStepIndex;
			}
		}

		return day?.progression?.currentStepIndex || 0;
	}, [day?.progression?.currentStepIndex, day?.progression?.lastProgressPayload, steps]);
	const [activeIndex, setActiveIndex] = useState(initialIndex);
	const [lastProgressPayload, setLastProgressPayload] = useState<Record<string, unknown> | null>(
		day?.progression?.lastProgressPayload || null
	);
	const [isScratchGestureActive, setIsScratchGestureActive] = useState(false);
	const [locallyRevealedStepId, setLocallyRevealedStepId] = useState<string | null>(null);
	const lastProgressPayloadRef = useRef<Record<string, unknown> | null>(
		day?.progression?.lastProgressPayload || null
	);

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
	const currentStepId =
		typeof currentStep?.id === "string" ? currentStep.id : `step_${activeIndex}`;
	const currentStepContent =
		currentStep?.content && typeof currentStep.content === "object"
			? currentStep.content
			: {};
	const currentAccentColor =
		normalizeThemeColor(String(currentStepContent.accentColor || "")) ||
		normalizeThemeColor(day?.accentColor) ||
		normalizeThemeColor(day?.category?.color) ||
		colorPink;
	// Server payload is the source of truth and is available the moment the day
	// loads; local optimistic state is layered on top for in-session updates.
	// Reading only from local state caused a mount race where the citation
	// briefly (or persistently, if startDay refetched) showed unrevealed.
	const persistedStepState = useMemo(
		() => ({
			...getStepState(day?.progression?.lastProgressPayload, currentStepId),
			...getStepState(lastProgressPayload, currentStepId),
		}),
		[currentStepId, day?.progression?.lastProgressPayload, lastProgressPayload]
	);
	const isCitationStep = isCitationStepRecord(currentStep);
	const isDicoStep = isDicoQuestionStepRecord(currentStep);
	const citationRevealed =
		Boolean(persistedStepState.citationRevealed) ||
		locallyRevealedStepId === currentStepId;

	if (isLoading) {
		return <Loader />;
	}

	const dicoAnswered = Boolean(
		persistedStepState.answered && persistedStepState.selectedAnswerKey
	);
	const dicoAnswers = Array.isArray(currentStepContent.answers)
		? (currentStepContent.answers as ParcoursDicoAnswerOption[]).filter(
				(answer) =>
					answer &&
					typeof answer.key === "string" &&
					typeof answer.label === "string"
		  )
		: [];
	const requiresReveal = isCitationStep && currentStep?.stateMode === "reveal_once";
	const canAdvance =
		day?.progression.isReadOnly ||
		((!requiresReveal || citationRevealed) && (!isDicoStep || dicoAnswered));

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

		const isLastStep = activeIndex >= steps.length - 1;

		if (!isLastStep) {
			const nextIndex = activeIndex + 1;
			const nextStep = steps[nextIndex];
			const nextStepId =
				typeof nextStep?.id === "string" ? nextStep.id : `step_${nextIndex}`;
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
		const prevStepId =
			typeof prevStep?.id === "string" ? prevStep.id : `step_${prevIndex}`;
		setActiveIndex(prevIndex);
		await persistProgress({
			nextIndex: prevIndex,
			activeStepId: prevStepId,
		});
	};

	const handleSelectDicoAnswer = async (answerKey: string) => {
		if (day?.progression.isReadOnly) {
			return;
		}

		await persistProgress({
			nextIndex: activeIndex,
			activeStepId: currentStepId,
			stepId: currentStepId,
			stepPatch: {
				selectedAnswerKey: answerKey,
				answered: true,
			},
		});
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
							{formatDayDate(day?.availableFrom, day?.stepsPayload?.dayMeta?.dateLabel)}
						</Text>
						<StepCounter
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
						<Text style={styles.dateLabel}>
							{formatDayDate(day?.availableFrom, day?.stepsPayload?.dayMeta?.dateLabel)}
						</Text>
						<StepCounter
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
								selectedAnswerKey={persistedStepState.selectedAnswerKey || null}
								onSelectAnswer={(answerKey) => {
									void handleSelectDicoAnswer(answerKey);
								}}
								accentColor={currentAccentColor}
								disabled={Boolean(day?.progression.isReadOnly)}
							/>
						) : (
							<StepFallback step={currentStep || {}} />
						)}
					</View>
				</ScrollView>
			)}

			<FloatingNav
				canAdvance={Boolean(canAdvance)}
				isCompleting={completeDay.isPending || updateProgress.isPending}
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
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	pageBody: {
		flex: 1,
	},
	dateLabel: {
		fontSize: FontSize18,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 18,
	},
	topMeta: {
		paddingTop: 2,
	},
	counterBlock: {
		marginBottom: 22,
	},
	counterText: {
		fontSize: FontSizeH1,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 10,
	},
	counterTrack: {
		height: 4,
		borderRadius: 999,
		backgroundColor: "#F0D6E6",
		overflow: "hidden",
	},
	counterFill: {
		height: "100%",
		borderRadius: 999,
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
	floatingNav: {
		position: "absolute",
		left: 24,
		right: 24,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	quitButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	quitIconWrap: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: colorBlack,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 14 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 8,
	},
	quitLabel: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
	},
	nextButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colorPink,
		borderRadius: 999,
		paddingLeft: 10,
		paddingRight: 20,
		paddingVertical: 10,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 14 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 8,
	},
	nextButtonDisabled: {
		opacity: 0.45,
	},
	nextIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: colorWhite,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	nextLabel: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorWhite,
	},
});
