import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import MetierDetails from "../metiers/metierDetails";

export default function FavoriteQuestionDetails() {
	const params = useLocalSearchParams();
	const metierId = Number(params?.metierId);

	const { showTabBar, hideTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	return (
		<SwipeToGoBack>
			<MetierDetails metierId={metierId} />
		</SwipeToGoBack>
	);
}
