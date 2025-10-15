import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize22 } from "@/constants/fontsizes";
import { buttonBlack } from "@/constants/commonStyles";
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
	onPress?: () => void;
	locked?: boolean;
}

export default function CardSimpleButtonCitrationsMenu({
	image,
	content,
	category,
	onPress,
	locked = false,
}: Props) {
	const navigation = useNavigation<NavigationType>();

	const handlePress = () => {
		if (onPress) {
			onPress();
		} else {
			navigation.navigate("CitationsDetails", {
				citationCategory: category,
			});
		}
	};
	let [fontsLoaded] = useFonts({
		Inter_700Bold,
	});

	if (!fontsLoaded) {
		return null;
	}

	return (
		<TouchableOpacity
			style={[styles.cardWrapper, locked && styles.lockedCard]}
			onPress={handlePress}
			activeOpacity={0.8}>
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
							<View style={buttonBlack}>
								<Text style={styles.buttonText}>Voir</Text>
							</View>
						</View>
					</View>
				</ImageBackground>
			</View>
		</TouchableOpacity>
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
	buttonText: {
		color: colorWhite,
		fontWeight: "bold",
	},
	lockedCard: {
		opacity: 0.4,
	},
});
