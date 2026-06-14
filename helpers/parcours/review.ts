import { getStepState } from "@/helpers/parcours/progress";
import { getParcoursStepId } from "@/helpers/parcours/steps";
import {
	ParcoursDayStep,
	ParcoursTipsAndTacticsBlockStep,
} from "@/types/parcours";

const isAnsweredState = (state: Record<string, unknown>) =>
	Boolean(
		state.answered ||
			state.answerLocked ||
			typeof state.answerSubmittedKey === "string"
	);

const getCompletedTipsQuestionCount = (
	step: ParcoursTipsAndTacticsBlockStep,
	stepState: Record<string, unknown>
) => {
	const questions = Array.isArray(step.content?.questions)
		? step.content.questions
		: [];
	const tipsProgress =
		stepState.tipsProgress &&
		typeof stepState.tipsProgress === "object" &&
		!Array.isArray(stepState.tipsProgress)
			? (stepState.tipsProgress as Record<string, Record<string, unknown>>)
			: {};

	let completedCount = 0;
	for (let index = 0; index < questions.length; index += 1) {
		if (!isAnsweredState(tipsProgress[`pair_${index}`] || {})) {
			break;
		}
		completedCount += 1;
	}

	return completedCount;
};

export const getReviewableParcoursSteps = ({
	steps,
	currentStepIndex,
	lastProgressPayload,
}: {
	steps: ParcoursDayStep[];
	currentStepIndex: number;
	lastProgressPayload: Record<string, unknown> | string | null | undefined;
}) => {
	const reviewSteps: ParcoursDayStep[] = [];

	for (let index = 0; index < steps.length; index += 1) {
		const step = steps[index];
		const stepState = getStepState(
			lastProgressPayload,
			getParcoursStepId(step, index)
		);
		const wasPassed = currentStepIndex > index;

		if (step.type === "tips_and_tactics_block") {
			const tipsStep = step as ParcoursTipsAndTacticsBlockStep;
			const questions = Array.isArray(tipsStep.content?.questions)
				? tipsStep.content.questions
				: [];
			const completedCount = wasPassed
				? questions.length
				: getCompletedTipsQuestionCount(tipsStep, stepState);

			if (completedCount === 0) {
				break;
			}

			reviewSteps.push({
				...tipsStep,
				content: {
					...tipsStep.content,
					questions: questions.slice(0, completedCount),
					dayQuestionCount: completedCount,
				},
			});

			if (completedCount < questions.length) {
				break;
			}
			continue;
		}

		const isCompleted =
			wasPassed ||
			(step.type === "citation" && Boolean(stepState.citationRevealed)) ||
			(step.type === "dico_question" && isAnsweredState(stepState)) ||
			(step.type === "specific_rubrique" &&
				Boolean(stepState.videoCompleted || stepState.videoNextUnlocked)) ||
			(step.type === "game_block" && Boolean(stepState.gameCompleted));

		if (!isCompleted) {
			break;
		}

		reviewSteps.push(step);
	}

	return reviewSteps;
};
