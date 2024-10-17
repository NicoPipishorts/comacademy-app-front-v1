import AndroidBackButton from "@/components/buttons/androidBack";
import { colorGreen, colorPink, colorWhite } from "@/constants/colors";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { Answer } from "@/types/enums";
import { NavigationType } from "@/types/general";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function FeedbkacMessage() {
	const navigation = useNavigation<NavigationType>();
	const { answer } = useLocalSearchParams();
	const { isAndroid } = useDeviceTypeCheckers();

	useEffect(() => {
		const timer = setTimeout(() => {
			navigation.goBack();
		}, 1000);

		return () => clearTimeout(timer);
	}, [navigation]);

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
				<View>
					<Text style={styles.feedbackText}>{answer}</Text>
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
