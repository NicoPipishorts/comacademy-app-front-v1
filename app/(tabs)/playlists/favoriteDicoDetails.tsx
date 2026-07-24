import useHideTabBarOnFocus from "@/hooks/useHideTabBarOnFocus";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useLocalSearchParams } from "expo-router";
import DicoDetails from "../dico/dicoDetails";

export default function FavoriteDicoDetails() {
	const { dicoId } = useLocalSearchParams();

	useHideTabBarOnFocus();

	return (
		<SwipeToGoBack>
			<DicoDetails dicoId={Number(dicoId)} />
		</SwipeToGoBack>
	);
}
