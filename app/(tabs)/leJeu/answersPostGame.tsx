import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import AnswersCard from "@/components/leJeu/answers/AnswersCard";
import {
	colorBlack,
	colorTurquoise,
	colorTurquoiseRGB,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import { useGetEndOfSessionResults } from "@/hooks/useGetEndOfSession";
import { useGameContext } from "@/providers/gameDataContext";
import SwipeToGoBack from "@/utils/swipeToGoBack";
import { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";

export default function AnswersPostGame() {
	const { sessionId: gameId } = useGameContext();

	const { data: allAnswerData } = useGetEndOfSessionResults(gameId);

	const { hideTabBar, showTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	if (!allAnswerData) {
		return <Loader />;
	}

	return (
		<View style={styles.wrapper}>
			<SwipeToGoBack>
				<ReturnButton />

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={[styles.scrollWrapper, { paddingBottom: 100 }]}
					style={{ flex: 1 }}>
					<View>
						{allAnswerData.data.allQuestions.map((answer) => {
							return (
								<AnswersCard
									key={answer.id}
									id={answer.id}
									data={answer}
									postGame={true}
								/>
							);
						})}
					</View>
				</ScrollView>
			</SwipeToGoBack>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingTop: 40,
		paddingHorizontal: 20,
		overflow: "visible",
		backgroundColor: primaryBackground,
	},
	scrollWrapper: {
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	cardContainer: {
		minWidth: "100%",
		borderRadius: 18,
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: colorBlack,
	},
	cardResults: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	cardResultsLarge: {
		fontSize: 76,
		fontWeight: "bold",
		color: colorWhite,
	},
	cardResultsSmall: {
		fontSize: FontSize16,
		color: colorWhite,
		paddingBottom: 10,
	},
	cardProgressContainer: {
		overflow: "hidden",
		minWidth: "100%",
		minHeight: 10,
		marginTop: 5,
		marginBottom: 15,
		borderRadius: 50,
		backgroundColor: `rgba(${colorTurquoiseRGB}, 0.2)`,
	},
	cardProgressBar: {
		minHeight: 10,
		borderRadius: 50,
		backgroundColor: colorTurquoise,
	},
	cardUnlocked: {
		fontSize: FontSize14,
		color: colorWhite,
		fontWeight: "bold",
	},
});
