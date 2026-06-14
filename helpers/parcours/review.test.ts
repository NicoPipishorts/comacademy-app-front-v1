import { getReviewableParcoursSteps } from "./review";

const steps = [
	{ id: "citation", type: "citation", content: {} },
	{ id: "dico", type: "dico_question", content: {} },
	{
		id: "tips",
		type: "tips_and_tactics_block",
		content: {
			questions: [
				{ question: "Question 1" },
				{ question: "Question 2" },
				{ question: "Question 3" },
			],
		},
	},
	{ id: "game", type: "game_block", content: {} },
];

describe("getReviewableParcoursSteps", () => {
	it("stops before the first unfinished step", () => {
		const result = getReviewableParcoursSteps({
			steps,
			currentStepIndex: 1,
			lastProgressPayload: {
				stepState: {
					citation: { citationRevealed: true },
					dico: {},
				},
			},
		});

		expect(result.map((step) => step.id)).toEqual(["citation"]);
	});

	it("keeps only consecutive answered Tips pairs", () => {
		const result = getReviewableParcoursSteps({
			steps,
			currentStepIndex: 2,
			lastProgressPayload: {
				stepState: {
					citation: { citationRevealed: true },
					dico: { answered: true },
					tips: {
						tipsProgress: {
							pair_0: { answered: true },
							pair_1: { answerLocked: true },
						},
					},
				},
			},
		});

		expect(result.map((step) => step.id)).toEqual(["citation", "dico", "tips"]);
		expect(result[2].content?.questions).toHaveLength(2);
	});
});
