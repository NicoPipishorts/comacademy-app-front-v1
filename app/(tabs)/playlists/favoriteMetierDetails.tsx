import useHideTabBarOnFocus from "@/hooks/useHideTabBarOnFocus";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useLocalSearchParams } from "expo-router";
import MetierDetails from "../metiers/metierDetails";

export default function FavoriteMetierDetails() {
	const params = useLocalSearchParams();
	const metierId = Number(params?.metierId);

	useHideTabBarOnFocus();

	return (
		<SwipeToGoBack>
			<MetierDetails metierId={metierId} />
		</SwipeToGoBack>
	);
}
