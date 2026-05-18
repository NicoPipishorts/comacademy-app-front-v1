import {
	ParcoursDayStep,
	ParcoursDicoQuestionStep,
	ParcoursGameBlockStep,
	ParcoursSpecificRubriqueStep,
	ParcoursTipsAndTacticsBlockStep,
} from "@/types/parcours";

export const toParcoursDayStep = (value: unknown): ParcoursDayStep =>
	value && typeof value === "object" ? (value as ParcoursDayStep) : {};

export const getParcoursStepId = (
	step: ParcoursDayStep | null | undefined,
	index: number
) => (typeof step?.id === "string" ? step.id : `step_${index}`);

export const isCitationParcoursStep = (
	step: ParcoursDayStep | null | undefined
): step is Extract<ParcoursDayStep, { type: "citation" }> => step?.type === "citation";

export const isDicoQuestionParcoursStep = (
	step: ParcoursDayStep | null | undefined
): step is ParcoursDicoQuestionStep => step?.type === "dico_question";

export const isSpecificRubriqueParcoursStep = (
	step: ParcoursDayStep | null | undefined
): step is ParcoursSpecificRubriqueStep => step?.type === "specific_rubrique";

export const isTipsAndTacticsParcoursStep = (
	step: ParcoursDayStep | null | undefined
): step is ParcoursTipsAndTacticsBlockStep => step?.type === "tips_and_tactics_block";

export const isGameBlockParcoursStep = (
	step: ParcoursDayStep | null | undefined
): step is ParcoursGameBlockStep => step?.type === "game_block";
