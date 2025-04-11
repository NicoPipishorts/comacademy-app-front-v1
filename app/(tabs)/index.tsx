import OnboardingV1 from "@/components/onboarding/OnboardingV1";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import useUserId from "@/hooks/useUserId";
import {
	getOnboardingStatus,
	setOnboardingStatus,
} from "@/services/onboarding/Onboarding";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const HomeScreen: React.FC = () => {
	const { userId } = useUserId();
	const [isOnboardingComplete, setIsOnboardingComplete] = useState<
		boolean | null
	>(null);
	const router = useRouter();
	const { hideTabBar, showTabBar } = useTabBarVisibility();

	useEffect(() => {
		const fetchOnboardingStatus = async (): Promise<void> => {
			if (!userId) return; // Skip fetching if no user ID is available
			const status = await getOnboardingStatus(userId);
			setIsOnboardingComplete(status);
		};

		fetchOnboardingStatus();
	}, [userId]);

	const handleOnboardingComplete = useCallback(async (): Promise<void> => {
		if (!userId) return; // Ensure the user ID is available
		await setOnboardingStatus(userId, true);
		setIsOnboardingComplete(true);
		showTabBar();
	}, [userId, showTabBar]);

	useEffect(() => {
		if (isOnboardingComplete === true) {
			router.replace("/feed");
		} else if (isOnboardingComplete === false) {
			hideTabBar();
		}
	}, [isOnboardingComplete, router, hideTabBar]);

	if (!userId || isOnboardingComplete === null) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			{/* Conditionally render onboarding or your main content */}
			{isOnboardingComplete ? null : (
				<OnboardingV1 onComplete={handleOnboardingComplete} />
			)}
		</View>
	);
};

export default HomeScreen;
