// src/components/buttons/CitationHeart.tsx
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import ActionIconButton from "@/components/buttons/actionIconButton";
import { useCitationFavorites } from "@/context/CitationFavoritesContext";
import React, { useEffect, useState } from "react";
import { ImageSourcePropType } from "react-native";

type Props = {
	id: number;
	filledIcon?: ImageSourcePropType;
	emptyIcon?: ImageSourcePropType;
	containerStyle?: any;
	imageStyle?: any;
};

export default function CitationHeart({
	id,
	filledIcon = HeartFull,
	emptyIcon = Heart,
	containerStyle,
	imageStyle,
}: Props) {
	const { isFavorite, toggle, isMutating } = useCitationFavorites();

	// sticky desired state to avoid flicker
	const serverFav = isFavorite(id);
	const [desired, setDesired] = useState<boolean | null>(null);
	useEffect(() => {
		if (desired !== null && desired === serverFav) setDesired(null);
	}, [desired, serverFav]);
	useEffect(() => setDesired(null), [id]);

	const show = desired !== null ? desired : serverFav;

	return (
		<ActionIconButton
			key={show ? "fav-on" : "fav-off"}
			onPress={() => {
				const next = !serverFav;
				setDesired(next);
				toggle(id);
			}}
			source={show ? filledIcon : emptyIcon}
			containerStyle={containerStyle}
			imageStyle={imageStyle}
			disabled={isMutating}
			accessibilityLabel={show ? "Remove from favorites" : "Add to favorites"}
		/>
	);
}
