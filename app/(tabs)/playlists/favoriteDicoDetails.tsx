import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import DicoDetails from "../dico/dicoDetails";

export default function FavoriteQuestionDetails() {
	const { dicoId } = useLocalSearchParams();

	const { showTabBar, hideTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	return (
		<SwipeToGoBack>
			<DicoDetails dicoId={Number(dicoId)} />
		</SwipeToGoBack>
	);
}
