import {
	buildTimedOutParcoursDicoStepPatch,
	buildValidatedParcoursDicoStepPatch,
	resolveParcoursDicoState,
} from "@/helpers/parcours/dico";
import { StepStateRecord } from "@/helpers/parcours/progress";
import {
	ParcoursDicoAnswerOption,
	ParcoursTipsAndTacticsCard,
	ParcoursTipsAndTacticsQuestion,
} from "@/types/parcours";

type TipsContent = Record<string, unknown>;

const isAnswerOption = (value: unknown): value is ParcoursDicoAnswerOption =>
	Boolean(
		value &&
			typeof value === "object" &&
			typeof (value as ParcoursDicoAnswerOption).key === "string" &&
			typeof (value as ParcoursDicoAnswerOption).label === "string"
	);

const isTipsCard = (value: unknown): value is ParcoursTipsAndTacticsCard =>
	Boolean(value && typeof value === "object");

const isTipsQuestion = (value: unknown): value is ParcoursTipsAndTacticsQuestion =>
	Boolean(value && typeof value === "object");

export const getParcoursTipsQuestions = (content: TipsContent) =>
	Array.isArray(content.questions)
		? (content.questions as unknown[]).filter(isTipsQuestion).map((question) => ({
				question:
					typeof question.question === "string" ? question.question : undefined,
				correctAnswerKey:
					typeof question.correctAnswerKey === "string"
						? question.correctAnswerKey
						: undefined,
				answers: Array.isArray(question.answers)
					? question.answers.filter(isAnswerOption)
					: [],
				card: isTipsCard(question.card) ? question.card : null,
		  }))
		: [];

export const getParcoursTipsPairKey = (pairIndex: number) => `pair_${pairIndex}`;

const getTipsProgressMap = (stepState: StepStateRecord) =>
	stepState.tipsProgress && typeof stepState.tipsProgress === "object"
		? stepState.tipsProgress
		: {};

export const resolveParcoursTipsState = ({
	content,
	stepState,
	draftAnswerKey,
	isReadOnly,
}: {
	content: TipsContent;
	stepState: StepStateRecord;
	draftAnswerKey?: string | null;
	isReadOnly?: boolean;
}) => {
	const questions = getParcoursTipsQuestions(content);
	const maxPairIndex = Math.max(questions.length - 1, 0);
	const requestedPairIndex =
		typeof stepState.tipsPairIndex === "number" ? stepState.tipsPairIndex : 0;
	const pairIndex = Math.min(Math.max(requestedPairIndex, 0), maxPairIndex);
	const pairKey = getParcoursTipsPairKey(pairIndex);
	const pairState = getTipsProgressMap(stepState)[pairKey] || {};
	const currentPair = questions[pairIndex] || null;
	const phase = stepState.tipsPhase === "card" ? "card" : "question";
	const dicoState = resolveParcoursDicoState({
		content: {
			correctAnswerKey: currentPair?.correctAnswerKey,
			answers: currentPair?.answers || [],
		},
		stepState: pairState,
		draftAnswerKey,
		isReadOnly,
	});

	return {
		questions,
		pairIndex,
		pairKey,
		pairState,
		currentPair,
		phase,
		isLastPair: pairIndex >= questions.length - 1,
		...dicoState,
	};
};

export const buildParcoursTipsPairPatch = ({
	stepState,
	pairIndex,
	phase,
	pairPatch,
}: {
	stepState: StepStateRecord;
	pairIndex: number;
	phase: "question" | "card";
	pairPatch?: StepStateRecord;
}): StepStateRecord => {
	const pairKey = getParcoursTipsPairKey(pairIndex);
	const currentTipsProgress = getTipsProgressMap(stepState);

	return {
		tipsPairIndex: pairIndex,
		tipsPhase: phase,
		tipsProgress: {
			...currentTipsProgress,
			[pairKey]: pairPatch
				? {
						...(currentTipsProgress[pairKey] || {}),
						...pairPatch,
				  }
				: currentTipsProgress[pairKey] || {},
		},
	};
};

export const buildValidatedParcoursTipsPairPatch = ({
	stepState,
	pairIndex,
	selectedAnswerKey,
	correctAnswerKey,
}: {
	stepState: StepStateRecord;
	pairIndex: number;
	selectedAnswerKey: string;
	correctAnswerKey: string;
}) =>
	buildParcoursTipsPairPatch({
		stepState,
		pairIndex,
		phase: "card",
		pairPatch: buildValidatedParcoursDicoStepPatch({
			selectedAnswerKey,
			correctAnswerKey,
		}),
	});

export const buildTimedOutParcoursTipsPairPatch = ({
	stepState,
	pairIndex,
	selectedAnswerKey,
	correctAnswerKey,
}: {
	stepState: StepStateRecord;
	pairIndex: number;
	selectedAnswerKey?: string | null;
	correctAnswerKey: string;
}) =>
	buildParcoursTipsPairPatch({
		stepState,
		pairIndex,
		phase: "card",
		pairPatch: buildTimedOutParcoursDicoStepPatch({
			selectedAnswerKey,
			correctAnswerKey,
		}),
	});
