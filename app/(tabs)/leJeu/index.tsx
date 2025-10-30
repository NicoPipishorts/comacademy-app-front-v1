// File: src/app/(tabs)/leJeu/index.tsx
import {
	colorBlack,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSessionAction } from "@/api/game/useNewSession";
import { UseAuth } from "@/auth/AuthContext";
import CategoriesCards from "@/components/categories/categories";
import FloatingTabBar from "@/components/FloatingTabBar";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { useTab } from "@/context/floatingTabbarContext";
import { useGameQuestions } from "@/hooks/Game/useGameQuestions";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import { useGetUserScore } from "@/hooks/useGetUsersScore";
import useJwtToken from "@/hooks/useJwtToken";
import { useGameContext } from "@/providers/gameDataContext";
import { useNetwork } from "@/providers/NetworkProvider";
import { NavigationType } from "@/types/general";
import { useFocusEffect, useNavigation } from "expo-router";
// import { useMemo } from "react";
import Answers from "./answers";
import LetsPlay from "./play";

export default function LeJeu() {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const { isConnected } = useNetwork();
	const { selectedTab, setSelectedTab } = useTab();

	const [isEnabled, setIsEnabled] = useState(false);
	const [activeTab, setActiveTab] = useState(0);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

	const { auth } = useAuthSession();
	const { token, loading: loadingToken } = useJwtToken();
	const { session } = UseAuth();

	// Check premium access status
	const hasPremiumAccess = React.useMemo(() => {
		if (session?.user?.manualPremium) return true;
		if (session?.user?.hasPremiumAccess) return true;

		const status = session?.user?.subscription?.status;
		return (
			status === "active" ||
			status === "grace_period" ||
			status === "billing_retry"
		);
	}, [
		session?.user?.manualPremium,
		session?.user?.hasPremiumAccess,
		session?.user?.subscription?.status,
	]);

	const isFreeUser = !hasPremiumAccess;

	// Get user score to check level
	const { data: scores } = useGetUserScore(token, auth?.user.id);
	const totalAnsweredQuestions =
		scores?.data?.[0]?.attributes?.totalAnsweredQuestions ?? 0;

	const {
		setDataGame,
		setSessionsId,
		setGameStatus,
		setQuestionsLeft,
		setAnsweredCount,
		gameStatus,
		sessionId,
		answeredCount,
	} = useGameContext();

	const sessionInProgress =
		gameStatus === "in_progress" && !!sessionId && answeredCount > 0;
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
		[sessionInProgress, handleSessionBlockedAction]
	);

	// session‑restart mutation
	const { mutate: newSession } = useSessionAction(
		(payload) => {
			setGameStatus(payload.status);
			setSessionsId(payload.sessionId);
			setQuestionsLeft(payload.questionsLeft);
			setAnsweredCount(payload.answeredCount);
			setDataGame(payload.questionsPool);
		},
		(err) => console.error("newSession failed:", err)
	);

	// ref to skip the very first render
	const didMountRef = useRef(false);

	// whenever filterByCat returns to null, restart the session
	useEffect(() => {
		// wait until token is loaded
		if (loadingToken) return;

		// skip initial mount
		if (!didMountRef.current) {
			didMountRef.current = true;
			return;
		}

		if (filterByCat === null && token && auth?.user.id) {
			newSession({ userId: auth?.user.id, token, action: "new" });
		}
	}, [filterByCat, token, loadingToken, newSession, auth?.user.id]);

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

	// fetch either “all” or “by‑category”
	// ⬇️ pass token + loading into the hook
	const {
		data: sessionData,
		isLoading: loadingQuestions,
		refetch,
	} = useGameQuestions(auth?.user.id, filterByCat, token, loadingToken);

	// ⬇️ ONLY refetch on focus if the token is ready
	useFocusEffect(
		useCallback(() => {
			if (!loadingToken && token && auth?.user.id) {
				refetch();
			}
		}, [loadingToken, token, auth?.user.id, refetch])
	);

	// when the network fetch returns, update context
	useEffect(() => {
		if (loadingQuestions || !sessionData) return;

		setGameStatus(sessionData.data.status);
		setSessionsId(sessionData.data.sessionId);
		setQuestionsLeft(sessionData.data.questionsLeft);
		setAnsweredCount(sessionData.data.answeredCount);
		setDataGame(sessionData.data.questionsPool);
	}, [
		loadingQuestions,
		sessionData,
		setDataGame,
		setSessionsId,
		setGameStatus,
		setQuestionsLeft,
		setAnsweredCount,
	]);

	useTrackPageMetrics({ page: "Jeu" });

	const toggleSwitch = useCallback(() => {
		setIsEnabled((p) => !p);
	}, []);

	const handlePressPlay = useCallback(() => {
		// Check if user has reached level 1 (150+ questions)
		const currentLevel = Math.floor(totalAnsweredQuestions / 150);

		// Only block if user is FREE AND has reached level 1
		if (isFreeUser && currentLevel >= 1) {
			// Show subscription modal instead of starting game
			setShowSubscriptionModal(true);
			return;
		}

		navigation.navigate("jeu");
	}, [navigation, totalAnsweredQuestions, isFreeUser]);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={styles.containerHeader}>
				<Text style={styles.headerMainText}>Le jeu</Text>
				<View style={styles.containerSwitch}>
					<Text style={styles.textJouer}>Jouer</Text>
					<Switch
						trackColor={{ false: colorBlack, true: colorYellow }}
						ios_backgroundColor={colorBlack}
						thumbColor={colorWhite}
						onValueChange={toggleSwitch}
						value={isEnabled}
					/>
					<Text style={styles.textReponses}>Réponses</Text>
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
		padding: 30,
		backgroundColor: primaryBackground,
	},
	containerHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerMainText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	containerSwitch: {
		flexDirection: "row",
		alignItems: "center",
	},
	textJouer: {
		paddingRight: 8,
		fontWeight: "bold",
	},
	textReponses: {
		paddingLeft: 8,
		fontWeight: "bold",
	},
	categoryWrapper: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 35,
	},
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 110,
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
