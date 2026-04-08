import {
	colorBlack,
	colorGreen,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { SessionResultsAllquestions } from "@/hooks/useGetEndOfSession";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	id: number;
	questionDocumentId?: string | null;
	data: SessionResultsAllquestions;
	postGame?: boolean;
}

export default function AnswersCard({ id, questionDocumentId, data, postGame }: Props) {
	const navigation = useNavigation<NavigationType>();

	// Navigate to the answersDetails screen
	const handlePress = () => {
		navigation.navigate("answersDetails", {
			questionId: id,
			questionDocumentId: questionDocumentId ?? undefined,
			postGame,
		});
	};

	return (
		<TouchableOpacity
			style={[
				styles.cardWrapper,
				{
					borderLeftWidth: 10,
					borderColor:
						data.userAnswer === data.questionAnswer ? colorGreen : colorPink,
				},
			]}
			onPress={handlePress}>
			<Text>{data.question}</Text>
			<View style={styles.contentWrapper}>
				<Text style={styles.answerText}>
					{data.questionAnswer ? "Vrai" : "Faux"}
				</Text>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		display: "flex",
		justifyContent: "flex-start",
		minWidth: "100%",
		marginBottom: 30,
		borderRadius: 15,
		padding: 15,
		paddingBottom: 10,
		backgroundColor: colorWhite,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	contentWrapper: {
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "flex-end",
		alignSelf: "flex-end",
		marginTop: 14,
		paddingHorizontal: 10,
		paddingVertical: 6,
		flexShrink: 1,
		backgroundColor: colorBlack,
		borderRadius: 10,
	},
	answerText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
