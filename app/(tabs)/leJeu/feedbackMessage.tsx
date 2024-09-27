import {
	colorBlack,
	colorGreen,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import { FontSize18 } from "@/constants/fontsizes";
import { Answer } from "@/types/enums";
import { NavigationType } from "@/types/general";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FeedbkacMessage() {
	const navigation = useNavigation<NavigationType>();
	const { answer, questionId } = useLocalSearchParams();

	return (
		<View
			style={[
				{
					backgroundColor: `${answer === Answer.true ? colorGreen : colorPink}`,
				},
				styles.feedbackContainer,
			]}>
			<Text style={styles.feedbackText}>{answer}</Text>

			<View
				style={{
					position: "absolute",
					bottom: 100,
					left: 0,
					width: "100%",
					alignItems: "center",
				}}>
				<TouchableOpacity
					style={{
						backgroundColor: colorBlack,
						paddingHorizontal: 20,
						paddingVertical: 8,
						borderRadius: 50,
					}}
					onPress={() =>
						navigation.navigate("answersDetails", {
							questionId: questionId,
							postGame: false,
						})
					}>
					<Text
						style={{
							color: colorWhite,
							fontSize: FontSize18,
							fontWeight: "bold",
						}}>
						Réponse
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	feedbackContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 15,
	},
	feedbackText: {
		fontSize: 100,
		color: colorWhite,
		fontWeight: "bold",
	},
});
