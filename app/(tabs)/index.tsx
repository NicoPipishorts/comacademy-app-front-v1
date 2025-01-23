import OnboardingV1 from "@/components/onboarding/OnboardingV1";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const HomeScreen = () => {
	const [isOnboardingComplete, setIsOnboardingComplete] = useState(null);
	const router = useRouter();
	const { hideTabBar, showTabBar } = useTabBarVisibility();

	// Temporary useEffect to reset onboarding status to false
	useEffect(() => {
		const resetOnboardingStatus = async () => {
			await AsyncStorage.setItem("onboardingComplete", "false");
		};

		resetOnboardingStatus();
	}, []); // This runs only once when the component mounts

	useEffect(() => {
		const checkOnboardingStatus = async () => {
			const status = await AsyncStorage.getItem("onboardingComplete");
			setIsOnboardingComplete(status === "true");
		};

		checkOnboardingStatus();
	}, []);

	const handleOnboardingComplete = useCallback(async () => {
		await AsyncStorage.setItem("onboardingComplete", "true");
		setIsOnboardingComplete(true);
		showTabBar();
	}, [showTabBar]);

	useEffect(() => {
		if (isOnboardingComplete === true) {
			router.replace("/feed");
		} else if (isOnboardingComplete === false) {
			hideTabBar(); // Hide the tab bar during onboarding
		}
	}, [isOnboardingComplete]); // Removed `router` and `hideTabBar` from dependencies

	if (isOnboardingComplete === null) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	return isOnboardingComplete ? null : (
		<OnboardingV1 onComplete={handleOnboardingComplete} />
	);
};

export default HomeScreen;
