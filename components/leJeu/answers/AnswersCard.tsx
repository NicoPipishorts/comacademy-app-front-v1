import {
	colorBlack,
	colorGreen,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import { GameSessionQuestion } from "@/types/game";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
	data: GameSessionQuestion;
}

export default function AnswersCard({ data }: Props) {
	// Use the router object to navigate
	const navigation = useNavigation<NavigationType>();

	// Navigate to the answersDetails screen
	const handlePress = () => {
		navigation.navigate("answersDetails", {
			questionId: data.id,
		});
	};

	return (
		<TouchableOpacity
			style={[
				styles.cardWrapper,
				{
					borderColor: data.attributes.questionId.data.attributes.ANSWER
						? colorGreen
						: colorPink,
				},
			]}
			onPress={handlePress} // Attach the handler here
		>
			<Text>{data.attributes.questionId.data.attributes.QUESTION}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		display: "flex",
		minWidth: "100%",
		marginBottom: 20,
		borderRadius: 15,
		padding: 15,
		backgroundColor: colorWhite,
		borderLeftWidth: 10,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	cardContentWrapper: {
		position: "relative",
		flexDirection: "column",
	},
});
