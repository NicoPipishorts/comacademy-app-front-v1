import {
	colorBlack,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { useTab } from "@/context/floatingTabbarContext";
import useGetUserGameSessionStatus from "@/hooks/Game/useGetUserGameSessionStatus";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { useNetwork } from "@/providers/NetworkProvider";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Answers from "./answers";
import LetsPlay from "./play";

const LeJeu = () => {
	const insets = useSafeAreaInsets();
	const { isConnected } = useNetwork();
	const navigation = useNavigation<NavigationType>();
	const { selectedTab, setSelectedTab } = useTab();
	const [isEnabled, setIsEnabled] = useState(false);
	const { userId } = useUserId();

	// Track metrics at the top level
	useTrackPageMetrics({ page: "Jeu" });

	const { setDataGame, setSessionsId, setGameStatus, dataGame } =
		useGameContext();

	const { data: sessionStatus, isLoading: loadingSession } =
		useGetUserGameSessionStatus(userId);

	// Memoize the handle functions
	const toggleSwitch = useCallback(() => {
		setIsEnabled((prev) => !prev);
	}, []);

	const handlePressPlay = useCallback(() => {
		navigation.navigate("jeu");
	}, [navigation]);

	useEffect(() => {
		if (loadingSession || !sessionStatus) return;
		if (!dataGame && sessionStatus?.data.status === "in_progress") {
			setGameStatus("in_progress");
			setSessionsId(sessionStatus?.data.sessionId);
			setDataGame(sessionStatus?.data.questionsPool);
		}
	}, [
		setDataGame,
		setSessionsId,
		setGameStatus,
		loadingSession,
		sessionStatus,
		dataGame,
	]);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top + 10 }]}>
			<View style={styles.containerHeader}>
				<View style={styles.header}>
					<Text style={styles.headerMainText}>Le jeu</Text>
				</View>
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

			{!isEnabled && (
				<LetsPlay
					setSelectedTab={setSelectedTab}
					selectedTab={selectedTab}
					handlePressPlay={handlePressPlay}
					disabled={isConnected}
				/>
			)}

			{isEnabled && <Answers />}
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		backgroundColor: primaryBackground,
	},
	containerHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignContent: "center",
	},
	header: {
		paddingVertical: 15,
	},
	headerMainText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	containerSwitch: {
		flexDirection: "row",
		justifyContent: "flex-end",
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
});

export default LeJeu;
