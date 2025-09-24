// src/components/buttons/FavoriteToggleButton.tsx
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import ActionIconButton from "@/components/buttons/actionIconButton";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { ImageStyle, StyleProp, ViewStyle } from "react-native";

export type FavoriteAdapter = {
	useFavorites: (userId: number | undefined) => { data: any | undefined };
	selectIds: (favoritesData: any | undefined) => number[];
	/** For list-style adapters return container id; for pair-based return null */
	selectDataId: (favoritesData: any | undefined) => number | null;
	/** Query key used to refetch/invalidates after toggle */
	queryKey: (userId: number | undefined) => unknown[];
	useMutate: (
		onSuccess: () => void,
		onError?: () => void
	) => {
		mutate: (params: {
			userId?: number;
			dataId?: number;
			updatedIds: number[];
			token?: string;
			___internalTargetId?: number;
		}) => void;
		isPending: boolean;
	};
};

type Props = {
	targetId: number;
	adapter: FavoriteAdapter;

	/** Image size etc. */
	imageStyle?: StyleProp<ImageStyle>;
	/** Positioning for the pressable container (absolute, margins, etc.) */
	containerStyle?: StyleProp<ViewStyle>;

	filledIcon?: any;
	emptyIcon?: any;
	disabledWhileMutating?: boolean;
	addA11yLabel?: string;
	removeA11yLabel?: string;
};

export default function FavoriteToggleButton({
	targetId,
	adapter,
	imageStyle,
	containerStyle,
	filledIcon = HeartFull,
	emptyIcon = Heart,
	disabledWhileMutating = true,
	addA11yLabel = "Add to favorites",
	removeA11yLabel = "Remove from favorites",
}: Props) {
	const { auth } = useAuthSession();
	const { token } = useJwtToken();

	const queryKey = adapter.queryKey(auth?.user.id);
	const { data } = adapter.useFavorites(auth?.user.id);
	const favoriteIds = adapter.selectIds(data);
	const dataId = adapter.selectDataId(data);

	const isFavorite = useMemo(
		() => favoriteIds.includes(targetId),
		[favoriteIds, targetId]
	);

	/**
	 * Sticky optimistic: the value we *want* the server to have.
	 * We keep rendering `desired` UNTIL server data (`isFavorite`) matches it.
	 * Then we clear `desired` and render pure server truth going forward.
	 */
	const [desired, setDesired] = useState<boolean | null>(null);

	// If server matches desired, clear it (flicker-free convergence)
	useEffect(() => {
		if (desired !== null && desired === isFavorite) {
			setDesired(null);
		}
	}, [desired, isFavorite]);

	// Reset any leftover desired state when the item/user changes
	useEffect(() => {
		setDesired(null);
	}, [targetId, auth?.user.id]);

	// For completeness: if the server ids set changes in any way,
	// re-evaluate desired in the effect above; no extra handling needed here.
	const lastServerSnapshot = useRef<string>("");
	useEffect(() => {
		const snap = JSON.stringify(favoriteIds);
		if (snap !== lastServerSnapshot.current) {
			lastServerSnapshot.current = snap;
			// no-op: the desired-clearing logic happens in the other effect
		}
	}, [favoriteIds]);

	const mutation = adapter.useMutate(
		() => {
			// Success: just invalidate; desired stays until server matches it
			queryClient.invalidateQueries({ queryKey });
		},
		() => {
			// Error: rollback desired immediately
			setDesired(null);
		}
	);

	// What we show:
	// - If `desired` is set, show it (sticky optimistic, no flicker)
	// - Otherwise show server truth `isFavorite`
	const showFavorite = desired !== null ? desired : isFavorite;

	const toggle = useCallback(() => {
		const next = !isFavorite;
		setDesired(next); // lock UI to the intended final state

		const updated = next
			? [...favoriteIds, targetId]
			: favoriteIds.filter((i) => i !== targetId);

		mutation.mutate({
			userId: auth?.user.id,
			dataId: dataId ?? undefined,
			updatedIds: updated,
			token,
			___internalTargetId: targetId,
		});
	}, [
		isFavorite,
		favoriteIds,
		targetId,
		mutation,
		auth?.user.id,
		dataId,
		token,
	]);

	return (
		<ActionIconButton
			key={showFavorite ? "fav-on" : "fav-off"} // force RN image swap reliably
			onPress={toggle}
			source={showFavorite ? filledIcon : emptyIcon}
			imageStyle={imageStyle}
			containerStyle={containerStyle}
			disabled={disabledWhileMutating && mutation.isPending}
			accessibilityLabel={showFavorite ? removeA11yLabel : addA11yLabel}
		/>
	);
}
