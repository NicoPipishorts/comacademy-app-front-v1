import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize22 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import {
	ImageBackground,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface Props {
	image: string;
	itemId: number;
	content: string;
}

export default function CardSimpleButtonSecrets({
	image,
	itemId,
	content,
}: Props) {
	const navigation = useNavigation<NavigationType>();

	return (
		<View style={styles.cardWrapper}>
			<View
				style={{
					borderRadius: 25,
					overflow: "hidden",
				}}>
				<ImageBackground
					source={{
						uri: `${process.env.EXPO_PUBLIC_URL}${image}`,
					}}
					style={styles.cardBackgroundImage}
					resizeMode='cover'>
					<View style={styles.cardTextContainer}>
						<View
							style={{
								flexDirection: "row",
								paddingHorizontal: 30,
								paddingVertical: 21,
								backgroundColor: colorWhite,
							}}>
							<Text style={styles.cardText}>{content}</Text>
							<TouchableOpacity
								style={styles.buttonBlack}
								onPress={() =>
									navigation.navigate("SecretsDetails", { itemId })
								}>
								<Text style={styles.buttonText}>Voir</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ImageBackground>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		display: "flex",
		flexDirection: "column",
		marginVertical: 20,
		marginHorizontal: 20,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
	},
	cardBackgroundImage: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	cardTextContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		maxWidth: "100%",
		height: 275,
	},
	cardText: {
		width: "60%",
		fontSize: FontSize22,
		fontWeight: "bold",
		flexGrow: 1,
	},
	buttonBlack: {
		backgroundColor: colorBlack,
		paddingVertical: 10,
		paddingHorizontal: 35,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
