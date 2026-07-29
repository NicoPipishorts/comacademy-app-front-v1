import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

/**
 * Hides the floating tab bar while the screen is focused and
 * restores it when the screen loses focus.
 */
export default function useHideTabBarOnFocus() {
	const { showTabBar, hideTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);
}
