import {
	colorBlack,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UseAuth } from "@/auth/AuthContext";
import CategoriesCards from "@/components/categories/categories";
import FloatingTabBar from "@/components/FloatingTabBar";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { useTab } from "@/context/floatingTabbarContext";
import { getGameLevel } from "@/helpers/gameProgress";
import { useGameQuestions } from "@/hooks/Game/useGameQuestions";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import { useGetUserScore } from "@/hooks/useGetUsersScore";
import useJwtToken from "@/hooks/useJwtToken";
import { useNetwork } from "@/providers/NetworkProvider";
import { useSubscription } from "@/src/hooks/useSubscription";
import { router, useFocusEffect } from "expo-router";
// import { useMemo } from "react";
import Answers from "./answers";
import LetsPlay from "./play";

export default function LeJeu() {
	const insets = useSafeAreaInsets();
	const { isConnected } = useNetwork();
	const { selectedTab, setSelectedTab } = useTab();

	const [isEnabled, setIsEnabled] = useState(false);
	const [activeTab, setActiveTab] = useState(0);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
	const segmentTranslateX = useRef(new Animated.Value(0)).current;
	const segmentWidth = 92;

	const { auth } = useAuthSession();
	const { token, loading: loadingToken } = useJwtToken();
	const { session } = UseAuth();
	const { hasPremiumAccess: backendHasPremiumAccess } = useSubscription();

	// Check premium access status
	const hasPremiumAccess = React.useMemo(() => {
		if (backendHasPremiumAccess) return true;
		if (session?.user?.manualPremium) return true;
		if (session?.user?.hasPremiumAccess) return true;

		const status = session?.user?.subscription?.status;
		return (
			status === "active" ||
			status === "grace_period" ||
			status === "billing_retry"
		);
	}, [
		backendHasPremiumAccess,
		session?.user?.manualPremium,
		session?.user?.hasPremiumAccess,
		session?.user?.subscription?.status,
	]);

	const isFreeUser = !hasPremiumAccess;

	// Get user score to check level
	const { data: scores } = useGetUserScore(token, auth?.user.id);
	const totalAnsweredQuestions =
		scores?.data?.[0]?.attributes?.totalAnsweredQuestions ?? 0;

	const [showSessionTooltip, setShowSessionTooltip] = useState(false);
	const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleSessionBlockedAction = useCallback(() => {
		setShowSessionTooltip(true);
		if (tooltipTimeoutRef.current) {
			clearTimeout(tooltipTimeoutRef.current);
		}
		tooltipTimeoutRef.current = setTimeout(() => {
			setShowSessionTooltip(false);
			tooltipTimeoutRef.current = null;
		}, 2000);
	}, []);

	const handleTabChange = useCallback(
		(nextTab: number) => {
			if (sessionInProgress && nextTab === 1) {
				handleSessionBlockedAction();
				return false;
			}
			return true;
		},
		[sessionInProgress, handleSessionBlockedAction],
	);

	// session‑restart mutation
	const {
		data: sessionData,
		refetch,
	} = useGameQuestions(auth?.user.id, null, token, loadingToken);

	const sessionInProgress =
		sessionData?.data.status === "in_progress" &&
		!!sessionData.data.sessionId &&
		sessionData.data.answeredCount > 0;

	useEffect(() => {
		if (sessionInProgress && activeTab === 1) {
			setActiveTab(0);
		}
	}, [sessionInProgress, activeTab, setActiveTab]);

	useEffect(() => {
		if (!sessionInProgress && tooltipTimeoutRef.current) {
			clearTimeout(tooltipTimeoutRef.current);
			tooltipTimeoutRef.current = null;
			setShowSessionTooltip(false);
		}
	}, [sessionInProgress]);

	useEffect(() => {
		return () => {
			if (tooltipTimeoutRef.current) {
				clearTimeout(tooltipTimeoutRef.current);
			}
		};
	}, []);

	// ⬇️ ONLY refetch on focus if the token is ready
	useFocusEffect(
		useCallback(() => {
			if (!loadingToken && token && auth?.user.id) {
				refetch();
			}
		}, [loadingToken, token, auth?.user.id, refetch]),
	);

	useTrackPageMetrics({ page: "Jeu" });

	const toggleSwitch = useCallback(() => {
		setIsEnabled((p) => !p);
	}, []);

	useEffect(() => {
		Animated.spring(segmentTranslateX, {
			toValue: isEnabled ? 1 : 0,
			useNativeDriver: true,
			bounciness: 6,
			speed: 18,
		}).start();
	}, [isEnabled, segmentTranslateX]);

	const handlePressPlay = useCallback(() => {
		const currentLevel = getGameLevel(totalAnsweredQuestions);

		// Only block if user is FREE AND has reached level 1
		if (isFreeUser && currentLevel >= 1) {
			// Show subscription modal instead of starting game
			setShowSubscriptionModal(true);
			return;
		}

		router.push({
			pathname: "/leJeu/jeu",
			params:
				filterByCat !== null ? { categoryId: String(filterByCat) } : undefined,
		});
	}, [totalAnsweredQuestions, isFreeUser, filterByCat]);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={styles.containerHeader}>
				<Text style={styles.headerMainText}>Le jeu</Text>
				<View style={styles.segmentedControl}>
					<Animated.View
						pointerEvents='none'
						style={[
							styles.segmentIndicator,
							{
								transform: [
									{
										translateX: segmentTranslateX.interpolate({
											inputRange: [0, 1],
											outputRange: [0, segmentWidth],
										}),
									},
								],
							},
						]}
					/>
					<Pressable
						onPress={() => {
							if (isEnabled) {
								toggleSwitch();
							}
						}}
						style={[
							styles.segmentButton,
						]}>
						<Text
							style={[
								styles.segmentText,
								!isEnabled && styles.segmentTextActive,
							]}>
							Jouer
						</Text>
					</Pressable>
					<Pressable
						onPress={() => {
							if (!isEnabled) {
								toggleSwitch();
							}
						}}
						style={styles.segmentButton}>
						<Text
							style={[
								styles.segmentText,
								isEnabled && styles.segmentTextActive,
							]}>
							Réponses
						</Text>
					</Pressable>
				</View>
			</View>

			{activeTab === 0 && !isEnabled && (
				<LetsPlay
					setSelectedTab={setSelectedTab}
					selectedTab={selectedTab}
					handlePressPlay={handlePressPlay}
					disabled={isConnected}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
				/>
			)}

			{activeTab === 1 && !isEnabled && (
				<View style={styles.categoryWrapper}>
					<CategoriesCards
						setFilterByCat={setFilterByCat}
						setActiveTab={setActiveTab}
						disabled={sessionInProgress}
					/>
				</View>
			)}

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					handlePress={handleTabChange}
					values={{ btn1: "Aléatoire", btn2: "Catégories" }}
				/>
			</View>

			{showSessionTooltip && (
				<View style={styles.tooltipContainer}>
					<Text style={styles.tooltipText}>Une partie est en cours</Text>
				</View>
			)}

			{isEnabled && <Answers />}

			<UpgradeSubscriptionModal
				visible={showSubscriptionModal}
				onClose={() => setShowSubscriptionModal(false)}
				message='Bravo ! Tu as terminé le niveau 0 avec 150 questions répondues ! Pour continuer ton aventure et débloquer tous les contenus, passe à la version Premium.'
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingHorizontal: 24,
		backgroundColor: primaryBackground,
	},
	containerHeader: {
		width: "100%",
		marginTop: 0,
		paddingTop: 35,
		paddingBottom: 14,
		marginBottom: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerMainText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	segmentedControl: {
		position: "relative",
		flexDirection: "row",
		alignItems: "center",
		padding: 3,
		borderRadius: 999,
		backgroundColor: "#E9E9E9",
	},
	segmentIndicator: {
		position: "absolute",
		left: 3,
		top: 3,
		bottom: 3,
		width: 92,
		borderRadius: 999,
		backgroundColor: colorBlack,
	},
	segmentButton: {
		minWidth: 92,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1,
	},
	segmentText: {
		fontWeight: "bold",
		fontSize: 13,
		color: "rgba(0,0,0,0.65)",
	},
	segmentTextActive: {
		color: colorWhite,
	},
	categoryWrapper: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 145,
		alignItems: "center",
	},
	tooltipContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 170,
		alignItems: "center",
	},
	tooltipText: {
		backgroundColor: colorBlack,
		color: colorWhite,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 16,
		fontWeight: "bold",
	},
});
