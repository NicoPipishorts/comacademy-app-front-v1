import AndroidBackButton from "@/components/buttons/androidBack";
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
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import useGetFinishedSessionAnswers from "@/hooks/useGetFinishedSessionAnswers";
import useUserId from "@/hooks/useUserId";
import { useGameContext } from "@/providers/gameDataContext";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AnswersPostGame() {
	const { userId } = useUserId();
	const { sessionId: gameId } = useGameContext();
	const { isAndroid } = useDeviceTypeCheckers();

	const { data: allAnswerData } = useGetFinishedSessionAnswers(userId, gameId);

	if (!allAnswerData) {
		return <Loader />;
	}

	const removeDuplicateAnswers = () => {
		// Step 1: Remove duplicates based on questionId.data.id
		const uniqueAnswers = allAnswerData.data.filter(
			(answer, index, self) =>
				index ===
				self.findIndex(
					(t) =>
						t.attributes.questionId.data.id ===
						answer.attributes.questionId.data.id
				)
		);

		return uniqueAnswers;
	};

	return (
		<View style={styles.wrapper}>
			{isAndroid && <AndroidBackButton />}

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.scrollWrapper, { paddingBottom: 100 }]}
				style={{ flex: 1 }}>
				<View style={{ paddingTop: 40 }}>
					{removeDuplicateAnswers().map((answer) => {
						return (
							<AnswersCard
								key={answer.attributes.questionId.data.id}
								id={answer.attributes.questionId.data.id}
								data={answer.attributes.questionId.data.attributes}
								postGame={true}
							/>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 20,
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
