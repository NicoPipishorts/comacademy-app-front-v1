import OnboardingV1 from "@/components/onboarding/OnboardingV1";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import useAuthSession from "@/hooks/useAuthSession";
import {
	getOnboardingStatus,
	setOnboardingStatus,
} from "@/services/onboarding/Onboarding";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const HomeScreen: React.FC = () => {
	const { auth } = useAuthSession();
	const userId = auth?.user?.id;
	const [isOnboardingComplete, setIsOnboardingComplete] = useState<
		boolean | null
	>(null);
	const router = useRouter();
	const { hideTabBar, showTabBar } = useTabBarVisibility();

	const fetchOnboardingStatus = useCallback(async (): Promise<void> => {
		if (!userId) return;
		const status = await getOnboardingStatus(userId);
		setIsOnboardingComplete(status);
	}, [userId]);

	useEffect(() => {
		void fetchOnboardingStatus();
	}, [fetchOnboardingStatus]);

	useFocusEffect(
		useCallback(() => {
			void fetchOnboardingStatus();
		}, [fetchOnboardingStatus]),
	);

	const handleOnboardingComplete = useCallback(async (): Promise<void> => {
		if (!userId) return;
		await setOnboardingStatus(userId, true);
		setIsOnboardingComplete(true);
		showTabBar();
	}, [showTabBar, userId]);

	useEffect(() => {
		if (isOnboardingComplete === true) {
			router.replace("/activity");
		} else if (isOnboardingComplete === false) {
			hideTabBar();
		}
	}, [isOnboardingComplete, router, hideTabBar]);

	if (!auth || isOnboardingComplete === null) {
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
