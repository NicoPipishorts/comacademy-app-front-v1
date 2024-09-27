import Chevron from "@/assets/imgs/icons/chevron.png";
import { FontSize12 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import {
	Image,
	ImageStyle,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function AndroidBackButton() {
	const navigation = useNavigation<NavigationType>();

	return (
		<View style={styles.backBtnContainer}>
			<TouchableOpacity
				style={styles.backButton}
				onPress={() => navigation.goBack()}>
				<Image
					source={Chevron}
					style={styles.backBtnIcon as ImageStyle}
					resizeMode='contain'
				/>
				<Text style={styles.backBtnText}>Retour</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	backBtnContainer: {
		alignItems: "flex-start",
		marginTop: 60,
	},
	backButton: {
		flexDirection: "row",
		alignItems: "center",
	},
	backBtnText: {
		fontSize: FontSize12,
		fontWeight: "bold",
	},
	backBtnIcon: {
		width: 15,
		height: 15,
		aspectRatio: 1,
		marginRight: 3,
	},
});
