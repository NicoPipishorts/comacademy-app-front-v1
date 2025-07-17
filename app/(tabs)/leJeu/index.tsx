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
import CategoriesCards from "@/components/categories/categories";
import FloatingTabBar from "@/components/FloatingTabBar";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { useTab } from "@/context/floatingTabbarContext";
import { useGameQuestions } from "@/hooks/Game/useGameQuestions";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { useNetwork } from "@/providers/NetworkProvider";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";

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

	const { userId } = useUserId();
	const { token, loading: loadingToken } = useJwtToken();

	const { setDataGame, setSessionsId, setGameStatus } = useGameContext();

	// session‑restart mutation
	const { mutate: newSession } = useSessionAction(
		(payload) => {
			setGameStatus(payload.status);
			setSessionsId(payload.sessionId);
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

		if (filterByCat === null && token) {
			newSession({ userId, token, action: "new" });
		}
	}, [filterByCat, token, loadingToken, newSession, userId]);

	// fetch either “all” or “by‑category”
	const { data: sessionData, isLoading: loadingQuestions } = useGameQuestions(
		userId,
		filterByCat
	);

	// when the network fetch returns, update context
	useEffect(() => {
		if (loadingQuestions || !sessionData) return;

		setGameStatus(sessionData.data.status);
		setSessionsId(sessionData.data.sessionId);
		setDataGame(sessionData.data.questionsPool);
	}, [
		loadingQuestions,
		sessionData,
		setDataGame,
		setSessionsId,
		setGameStatus,
	]);

	useTrackPageMetrics({ page: "Jeu" });

	const toggleSwitch = useCallback(() => {
		setActiveTab((t) => (t === 0 ? 1 : 0));
		setIsEnabled((p) => !p);
	}, []);

	const handlePressPlay = useCallback(() => {
		navigation.navigate("jeu");
	}, [navigation]);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top + 10 }]}>
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

			{activeTab === 1 && (
				<View style={styles.categoryWrapper}>
					<CategoriesCards
						setFilterByCat={setFilterByCat}
						setActiveTab={setActiveTab}
					/>
				</View>
			)}

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					handlePress={() => setActiveTab(activeTab === 0 ? 1 : 0)}
					values={{ btn1: "Voir Tout", btn2: "Catégories" }}
				/>
			</View>

			{isEnabled && <Answers />}
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
});
