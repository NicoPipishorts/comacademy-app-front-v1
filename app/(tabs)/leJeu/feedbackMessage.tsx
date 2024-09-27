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
				<Text style={styles.feedbackText}>{answer}</Text>

				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						position: "absolute",
						bottom: 150,
						left: 0,
						width: "100%",
						alignItems: "center",
					}}>
					<TouchableOpacity
						style={{
							borderColor: colorWhite,
							backgroundColor: answer === Answer.true ? colorGreen : colorPink,
							borderWidth: 2,
							paddingHorizontal: 20,
							paddingVertical: 8,
							borderRadius: 50,
							marginRight: 15,
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
								fontSize: FontSize16,
								fontWeight: "bold",
							}}>
							Réponse
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							borderColor: colorWhite,
							borderWidth: 2,
							backgroundColor: colorWhite,
							paddingHorizontal: 20,
							paddingVertical: 8,
							borderRadius: 50,
						}}
						onPress={() => navigation.goBack()}>
						<Text
							style={{
								color: answer === Answer.true ? colorGreen : colorPink,
								fontSize: FontSize16,
								fontWeight: "bold",
							}}>
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
