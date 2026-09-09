import AsyncStorage from "@react-native-async-storage/async-storage";

/** Sections that ship a one-off "about" sheet on first visit. */
export type OnboardingSection = "parcours" | "jeu";

// Kept in this exact shape on purpose: it is the key already written on devices
// by the parcours sheet, so widening this to other sections needs no migration.
const getSectionKey = (section: OnboardingSection, userId: number): string =>
	`${section}OnboardingSeen_${userId}`;

export const getSectionOnboardingSeen = async (
	section: OnboardingSection,
	userId: number
): Promise<boolean> => {
	if (!userId) {
		console.warn(`No userId provided for ${section} onboarding status check.`);
		return false;
	}
	const seen = await AsyncStorage.getItem(getSectionKey(section, userId));
	return seen === "true";
};

export const setSectionOnboardingSeen = async (
	section: OnboardingSection,
	userId: number,
	seen: boolean
): Promise<void> => {
	if (!userId) {
		console.warn(`No userId provided for setting ${section} onboarding status.`);
		return;
	}
	await AsyncStorage.setItem(
		getSectionKey(section, userId),
		seen ? "true" : "false"
	);
};

export const resetSectionOnboardingSeen = async (
	section: OnboardingSection,
	userId: number
): Promise<void> => setSectionOnboardingSeen(section, userId, false);

export const resetAllSectionOnboardingSeen = async (
	userId: number
): Promise<void> => {
	await Promise.all([
		resetSectionOnboardingSeen("parcours", userId),
		resetSectionOnboardingSeen("jeu", userId),
	]);
};
