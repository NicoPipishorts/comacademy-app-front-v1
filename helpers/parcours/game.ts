import { StepStateRecord } from "@/helpers/parcours/progress";
import { GameQuestionsResponse } from "@/types/userGameSessionStatus";

export const buildParcoursGameStepPatch = ({
	sessionId,
	answeredCount,
	questionCount,
	completed,
}: {
	sessionId: number;
	answeredCount: number;
	questionCount: number;
	completed: boolean;
}): StepStateRecord => ({
	gameSessionId: sessionId,
	gameAnsweredCount: answeredCount,
	gameQuestionCount: questionCount,
	gameCompleted: completed,
});

export const resolveParcoursGameState = ({
	stepState,
	session,
	questionCount,
}: {
	stepState: StepStateRecord;
	session?: GameQuestionsResponse | null;
	questionCount: number;
}) => {
	const persistedSessionId =
		typeof stepState.gameSessionId === "number" && Number.isFinite(stepState.gameSessionId)
			? stepState.gameSessionId
			: null;
	const answeredCount =
		typeof session?.answeredCount === "number"
			? session.answeredCount
			: typeof stepState.gameAnsweredCount === "number"
				? stepState.gameAnsweredCount
				: 0;
	const totalQuestions =
		typeof stepState.gameQuestionCount === "number" && stepState.gameQuestionCount > 0
			? stepState.gameQuestionCount
			: questionCount;
	const completed =
		session?.status === "finished" ||
		Boolean(stepState.gameCompleted) ||
		answeredCount >= totalQuestions;

	return {
		sessionId: session?.sessionId ?? persistedSessionId,
		answeredCount,
		totalQuestions,
		completed,
	};
};
