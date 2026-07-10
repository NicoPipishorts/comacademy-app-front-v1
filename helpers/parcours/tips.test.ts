import {
	buildParcoursTipsPairPatch,
	buildTimedOutParcoursTipsPairPatch,
	buildValidatedParcoursTipsPairPatch,
} from "./tips";

describe("Parcours Tips progress", () => {
	it("keeps the locked answer on the question until feedback closes", () => {
		const submitted = buildValidatedParcoursTipsPairPatch({
			stepState: {},
			pairIndex: 0,
			selectedAnswerKey: "b",
			correctAnswerKey: "b",
			phase: "question",
		});

		expect(submitted.tipsPhase).toBe("question");
		expect(submitted.tipsProgress?.pair_0).toMatchObject({
			answered: true,
			answerLocked: true,
			answerWasCorrect: true,
		});

		const revealed = buildParcoursTipsPairPatch({
			stepState: submitted,
			pairIndex: 0,
			phase: "card",
		});

		expect(revealed.tipsPhase).toBe("card");
		expect(revealed.tipsProgress?.pair_0).toMatchObject({
			answered: true,
			answerLocked: true,
		});
	});

	it("keeps a timed-out answer on the question until feedback closes", () => {
		const submitted = buildTimedOutParcoursTipsPairPatch({
			stepState: {},
			pairIndex: 0,
			correctAnswerKey: "a",
			phase: "question",
		});

		expect(submitted.tipsPhase).toBe("question");
		expect(submitted.tipsProgress?.pair_0).toMatchObject({
			answered: true,
			answerLocked: true,
			answerWasCorrect: false,
		});
	});
});
