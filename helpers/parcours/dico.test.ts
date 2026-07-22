import {
	buildParcoursDicoPhasePatch,
	buildTimedOutParcoursDicoStepPatch,
	buildValidatedParcoursDicoStepPatch,
	resolveParcoursDicoState,
} from "@/helpers/parcours/dico";

const content = {
	correctAnswerKey: "B",
	answers: [
		{ key: "A", label: "Première réponse" },
		{ key: "B", label: "Bonne réponse" },
	],
};

describe("parcours Dico phases", () => {
	it("defaults legacy progress to the question phase", () => {
		const state = resolveParcoursDicoState({
			content,
			stepState: { answered: true, answerLocked: true },
		});

		expect(state.phase).toBe("question");
		expect(state.answerLocked).toBe(true);
	});

	it("restores the persisted definition phase", () => {
		const state = resolveParcoursDicoState({
			content,
			stepState: { answered: true, dicoPhase: "definition" },
		});

		expect(state.phase).toBe("definition");
	});

	it("builds a phase-only progress patch", () => {
		expect(buildParcoursDicoPhasePatch("definition")).toEqual({
			dicoPhase: "definition",
		});
	});

	it("keeps a submitted answer on the locked question until feedback closes", () => {
		const state = resolveParcoursDicoState({
			content,
			stepState: {
				...buildValidatedParcoursDicoStepPatch({
					selectedAnswerKey: "A",
					correctAnswerKey: "B",
				}),
				dicoPhase: "question",
			},
		});

		expect(state.phase).toBe("question");
		expect(state.answerLocked).toBe(true);
		expect(state.submittedAnswerKey).toBe("A");
		expect(state.selectedAnswerKey).toBe("B");
	});

	it("keeps a timed-out answer on the locked question until feedback closes", () => {
		const state = resolveParcoursDicoState({
			content,
			stepState: {
				...buildTimedOutParcoursDicoStepPatch({ correctAnswerKey: "B" }),
				dicoPhase: "question",
			},
		});

		expect(state.phase).toBe("question");
		expect(state.answerLocked).toBe(true);
		expect(state.selectedAnswerKey).toBe("B");
	});
});
