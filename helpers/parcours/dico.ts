import { StepStateRecord } from "@/helpers/parcours/progress";
import { ParcoursDicoAnswerOption } from "@/types/parcours";

type DicoContent = Record<string, unknown>;

export const getParcoursDicoAnswers = (content: DicoContent) =>
	Array.isArray(content.answers)
		? (content.answers as ParcoursDicoAnswerOption[]).filter(
				(answer) =>
					answer &&
					typeof answer.key === "string" &&
					typeof answer.label === "string"
		  )
		: [];

export const resolveParcoursDicoState = ({
	content,
	stepState,
	draftAnswerKey,
	isReadOnly,
}: {
	content: DicoContent;
	stepState: StepStateRecord;
	draftAnswerKey?: string | null;
	isReadOnly?: boolean;
}) => {
	const answered = Boolean(stepState.answered);
	const correctAnswerKey =
		typeof content.correctAnswerKey === "string" ? content.correctAnswerKey : null;
	const selectedAnswerKey =
		typeof stepState.selectedAnswerKey === "string"
			? stepState.selectedAnswerKey
			: draftAnswerKey || null;
	const submittedAnswerKey =
		typeof stepState.answerSubmittedKey === "string"
			? stepState.answerSubmittedKey
			: null;
	const answerLocked = Boolean(isReadOnly) || Boolean(stepState.answerLocked || answered);
	const phase = stepState.dicoPhase === "definition" ? "definition" : "question";

	return {
		phase,
		answered,
		correctAnswerKey,
		selectedAnswerKey,
		submittedAnswerKey,
		answerLocked,
		hasSelection: Boolean(selectedAnswerKey),
		answerWasCorrect:
			typeof stepState.answerWasCorrect === "boolean"
				? stepState.answerWasCorrect
				: undefined,
		persistedCorrectAnswerKey:
			typeof stepState.correctAnswerKey === "string"
				? stepState.correctAnswerKey
				: correctAnswerKey,
	};
};

export const buildParcoursDicoPhasePatch = (
	phase: "question" | "definition"
): StepStateRecord => ({ dicoPhase: phase });

export const buildValidatedParcoursDicoStepPatch = ({
	selectedAnswerKey,
	correctAnswerKey,
}: {
	selectedAnswerKey: string;
	correctAnswerKey: string;
}): StepStateRecord => {
	const isCorrect = selectedAnswerKey === correctAnswerKey;

	return {
		selectedAnswerKey: isCorrect ? selectedAnswerKey : correctAnswerKey,
		answerSubmittedKey: selectedAnswerKey,
		correctAnswerKey,
		answerWasCorrect: isCorrect,
		answerLocked: true,
		answered: true,
	};
};

export const buildTimedOutParcoursDicoStepPatch = ({
	selectedAnswerKey,
	correctAnswerKey,
}: {
	selectedAnswerKey?: string | null;
	correctAnswerKey: string;
}): StepStateRecord => {
	const isCorrect = selectedAnswerKey === correctAnswerKey;

	return {
		selectedAnswerKey: correctAnswerKey,
		answerSubmittedKey: selectedAnswerKey || undefined,
		correctAnswerKey,
		answerWasCorrect: Boolean(selectedAnswerKey) ? isCorrect : false,
		answerLocked: true,
		answered: true,
	};
};
