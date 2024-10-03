import AndroidBackButton from "@/components/buttons/androidBack";
import { colorGreen, colorPink, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { Answer } from "@/types/enums";
import { NavigationType } from "@/types/general";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FeedbkacMessage() {
	const navigation = useNavigation<NavigationType>();
	const { answer, questionId } = useLocalSearchParams();
	const { isAndroid } = useDeviceTypeCheckers();

	return (
		<>
			{isAndroid && <AndroidBackButton />}

			<View
				style={[
					{
						backgroundColor: `${
							answer === Answer.true ? colorGreen : colorPink
						}`,
					},
					styles.feedbackContainer,
				]}>
				<View style={{ marginTop: "60%", marginBottom: "20%" }}>
					<Text style={styles.feedbackText}>{answer}</Text>
				</View>

				<View style={styles.buttonsContainer}>
					<TouchableOpacity
						style={[
							styles.buttons,
							{
								backgroundColor:
									answer === Answer.true ? colorGreen : colorPink,
							},
						]}
						onPress={() =>
							navigation.navigate("answersDetails", {
								questionId: questionId,
								postGame: false,
							})
						}>
						<Text style={styles.buttonsText}>Réponse</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.buttons}
						onPress={() => navigation.goBack()}>
						<Text
							style={[
								styles.buttonsText,
								{
									color: answer === Answer.true ? colorGreen : colorPink,
								},
							]}>
							Poursuivre
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	feedbackContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "flex-start",
		alignItems: "center",
		zIndex: 15,
	},
	feedbackText: {
		fontSize: 100,
		color: colorWhite,
		fontWeight: "bold",
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		left: 0,
		width: "100%",
	},
	buttons: {
		borderColor: colorWhite,
		borderWidth: 2,
		backgroundColor: colorWhite,
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 50,
	},
	buttonsText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
