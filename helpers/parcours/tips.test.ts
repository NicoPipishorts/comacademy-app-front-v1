import {
	buildParcoursTipsPairPatch,
	buildTimedOutParcoursTipsPairPatch,
	buildValidatedParcoursTipsPairPatch,
	getParcoursTipsRecoveryNavigation,
	resolveParcoursTipsState,
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

	it("recovers a persisted locked question directly to its linked card", () => {
		const staleProgress = buildTimedOutParcoursTipsPairPatch({
			stepState: {},
			pairIndex: 1,
			correctAnswerKey: "a",
			phase: "question",
		});

		expect(getParcoursTipsRecoveryNavigation(staleProgress)).toEqual({
			pairIndex: 1,
			phase: "card",
		});
	});

	it("does not override an unanswered question or an existing card phase", () => {
		expect(
			getParcoursTipsRecoveryNavigation({
				tipsPairIndex: 0,
				tipsPhase: "question",
			})
		).toBeNull();

		expect(
			getParcoursTipsRecoveryNavigation({
				tipsPairIndex: 0,
				tipsPhase: "card",
				tipsProgress: { pair_0: { answered: true } },
			})
		).toBeNull();
	});

	it("does not let the nested Dico answer phase overwrite the Tips card phase", () => {
		const state = buildValidatedParcoursTipsPairPatch({
			stepState: {},
			pairIndex: 0,
			selectedAnswerKey: "a",
			correctAnswerKey: "a",
			phase: "card",
		});

		const resolved = resolveParcoursTipsState({
			content: {
				questions: [
					{
						question: "Question",
						correctAnswerKey: "a",
						answers: [
							{ key: "a", label: "Correct" },
							{ key: "b", label: "Wrong" },
						],
						card: { text: "Linked card" },
					},
				],
			},
			stepState: state,
		});

		expect(resolved.phase).toBe("card");
	});
});
