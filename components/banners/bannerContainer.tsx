import BannerFree from "@/components/banners/bannerFree";
import { useFocusEffect } from "expo-router"; // or '@react-navigation/native'
import React, { useState } from "react";

const BannerContainer: React.FC = () => {
	const [shouldShowBanner, setShouldShowBanner] = useState(true);

	// Reset banner state each time this container gets focus
	useFocusEffect(
		React.useCallback(() => {
			setShouldShowBanner(true);
		}, [])
	);

	return shouldShowBanner ? (
		<BannerFree onDismiss={() => setShouldShowBanner(false)} />
	) : null;
};

export default BannerContainer;
