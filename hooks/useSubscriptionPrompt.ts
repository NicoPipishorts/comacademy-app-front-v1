import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "subscription_prompt_shown_level_1";

interface UseSubscriptionPromptResult {
	shouldShowModal: boolean;
	dismissModal: () => void;
}

/**
 * Hook to detect when user reaches level 1 (150 questions answered)
 * and show subscription prompt once
 */
export const useSubscriptionPrompt = (
	totalAnsweredQuestions: number
): UseSubscriptionPromptResult => {
	const [shouldShowModal, setShouldShowModal] = useState(false);
	const [hasChecked, setHasChecked] = useState(false);

	useEffect(() => {
		const checkAndShowPrompt = async () => {
			// Don't check if we already have
			if (hasChecked) return;

			// Calculate current level (same logic as in niveaux.tsx)
			const currentLevel = Math.floor(totalAnsweredQuestions / 150);

			// Only show if user is at level 1 or higher
			if (currentLevel >= 1) {
				try {
					// Check if we've already shown the prompt
					const hasShown = await AsyncStorage.getItem(STORAGE_KEY);

					if (!hasShown) {
						setShouldShowModal(true);
					}
				} catch (error) {
					console.error("Error checking subscription prompt status:", error);
				}
			}

			setHasChecked(true);
		};

		checkAndShowPrompt();
	}, [totalAnsweredQuestions, hasChecked]);

	const dismissModal = async () => {
		try {
			// Mark as shown so it doesn't appear again
			await AsyncStorage.setItem(STORAGE_KEY, "true");
			setShouldShowModal(false);
		} catch (error) {
			console.error("Error saving subscription prompt status:", error);
			setShouldShowModal(false);
		}
	};

	return {
		shouldShowModal,
		dismissModal,
	};
};
