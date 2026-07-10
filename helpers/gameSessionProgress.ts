import { QUESTIONS_PER_ROUND } from "./gameProgress";
import { GameQuestionsResponse, QuestionData } from "../types/userGameSessionStatus";

type SessionProgressInput = Pick<
	GameQuestionsResponse,
	"answeredCount" | "questionsPool"
>;

export function getSessionCurrentIndex(questionsPool: QuestionData[]) {
	return questionsPool.length > 0 ? questionsPool.length - 1 : 0;
}

export function getSessionCurrentCardNumber(
	session: SessionProgressInput,
	totalCards = QUESTIONS_PER_ROUND
) {
	if (session.questionsPool.length === 0) {
		return totalCards;
	}

	return Math.min(totalCards, Math.max(1, session.answeredCount + 1));
}

export function getDisplayedCardCounter(
	currentCardNumber: number,
	questionsLeft: number,
	totalCards = QUESTIONS_PER_ROUND
) {
	return questionsLeft > 0 ? currentCardNumber : totalCards;
}

export function getNextCardNumber(
	currentCardNumber: number,
	totalCards = QUESTIONS_PER_ROUND
) {
	return Math.min(totalCards, currentCardNumber + 1);
}

