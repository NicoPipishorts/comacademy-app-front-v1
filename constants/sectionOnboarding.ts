import type { OnboardingSection } from "@/services/onboarding/SectionOnboarding";

export type SectionAboutContent = {
	title: string;
	bullets: readonly string[];
	/** Two gradient stops; repeat one colour for the flat arrows. */
	arrowColors: readonly [string, string];
	/** Index of the tab the reveal animation flies out from. */
	tabIndex: number;
};

/** Copy and colours transcribed from assets/imgs/onboarding/v2/Screen7.svg. */
const PARCOURS_ABOUT: SectionAboutContent = {
	title: "Chaque jour\ncompte :\nDébloque tes bonus",
	bullets: [
		"Du nouveau chaque jour",
		"Fais-ton parcours quotidien",
		"Une semaine complète =\nUn bonus débloqué !",
		"Du retard ? Tu as jusqu’au dimanche minuit pour le rattraper.",
		"Tes ”Vrais/ Faux” comptent pour le classement général.",
		"Retrouve tous tes parcours a tous moments",
	],
	arrowColors: ["#ff207b", "#5974c9"],
	tabIndex: 2,
};

/** Copy and colours transcribed from assets/imgs/onboarding/v2/Screen4.svg. */
const JEU_ABOUT: SectionAboutContent = {
	title: "Vrai/ faux :\n15 questions par sessions",
	bullets: [
		"Pas d’accord ? Swipe à gauche",
		"D’accord ? Swipe à droite",
		"Joue en aléatoire ou choisis ta catégorie",
		"Découvre tes stats après chaque session",
		"Suis ton classement général",
		"Retrouve toutes les réponses",
	],
	arrowColors: ["#c33685", "#c33685"],
	tabIndex: 1,
};

export const SECTION_ABOUT: Record<OnboardingSection, SectionAboutContent> = {
	parcours: PARCOURS_ABOUT,
	jeu: JEU_ABOUT,
};
