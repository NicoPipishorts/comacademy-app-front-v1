import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize22 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { LinearGradient } from "expo-linear-gradient";
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
			<ImageBackground
				source={{
					uri: `${process.env.EXPO_PUBLIC_URL}${image}`,
				}}
				style={styles.cardBackgroundImage}
				resizeMode='cover'>
				<LinearGradient
					colors={["transparent", colorWhite]}
					start={{ x: 0.5, y: 0.15 }}
					end={{ x: 0.5, y: 1 }}
					locations={[0, 0.68]} // Make the white part start at 80% of the height
					style={{ flex: 1, width: "100%" }}>
					<View style={styles.cardTextContainer}>
						<Text style={styles.cardText}>{content}</Text>
						<TouchableOpacity
							style={styles.buttonBlack}
							onPress={() => navigation.navigate("SecretsDetails", { itemId })}>
							<Text style={styles.buttonText}>Voir</Text>
						</TouchableOpacity>
					</View>
				</LinearGradient>
			</ImageBackground>
		</View>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		display: "flex",
		flexDirection: "column",
		marginBottom: 40,
		width: "100%",
		borderRadius: 25,
		overflow: "hidden",
		backgroundColor: colorWhite,
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
		paddingHorizontal: 30,
		paddingBottom: 21,
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
