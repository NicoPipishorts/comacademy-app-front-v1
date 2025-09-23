import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize22 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
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
	content: string;
	category: string;
}

export default function CardSimpleButtonCitrationsMenu({
	image,
	content,
	category,
}: Props) {
	const navigation = useNavigation<NavigationType>();
	let [fontsLoaded] = useFonts({
		Inter_700Bold,
	});

	if (!fontsLoaded) {
		return null;
	}

	return (
		<View style={styles.cardWrapper}>
			<View
				style={{
					borderRadius: 25,
					overflow: "hidden",
				}}>
				<ImageBackground
					source={{
						uri: `${image}`,
					}}
					style={styles.cardBackgroundImage}
					resizeMode='cover'>
					<View style={styles.cardTextContainer}>
						<View style={styles.buttonContainer}>
							<Text style={styles.cardText}>{content}</Text>
							<TouchableOpacity
								style={styles.buttonBlack}
								onPress={() =>
									navigation.navigate("CitationsDetails", {
										citationCategory: category,
									})
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
	buttonContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 20,
		backgroundColor: colorWhite,
	},
	buttonBlack: {
		backgroundColor: colorBlack,
		paddingVertical: 10,
		paddingHorizontal: 25,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
});
