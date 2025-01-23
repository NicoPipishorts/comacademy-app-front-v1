import AsyncStorage from "@react-native-async-storage/async-storage";

const getOnboardingKey = (userId: number): string =>
	`onboardingComplete_${userId}`;

export const getOnboardingStatus = async (userId: number): Promise<boolean> => {
	if (!userId) {
		console.warn("No userId provided for onboarding status check.");
		return false;
	}
	const key = getOnboardingKey(userId);
	const status = await AsyncStorage.getItem(key);
	return status === "true";
};

export const setOnboardingStatus = async (
	userId: number,
	status: boolean
): Promise<void> => {
	if (!userId) {
		console.warn("No userId provided for setting onboarding status.");
		return;
	}
	const key = getOnboardingKey(userId);
	await AsyncStorage.setItem(key, status ? "true" : "false");
};

export const resetOnboardingStatus = async (userId: number): Promise<void> => {
	if (!userId) {
		console.warn("No userId provided for resetting onboarding status.");
		return;
	}
	const key = getOnboardingKey(userId);
	await AsyncStorage.setItem(key, "false");
};
