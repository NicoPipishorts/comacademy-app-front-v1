import Chevron from "@/assets/imgs/icons/chevron.png";
import { FontSize12 } from "@/constants/fontsizes";
import { useNavigation, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ReturnButton({
	destination,
}: {
	destination?: string | null;
}) {
	const navigation = useNavigation<any>();
	const router = useRouter();

	const handlePress = () => {
		if (destination) {
			router.replace(destination as any);
			return;
		}

		if (typeof router.canGoBack === "function" && router.canGoBack()) {
			router.back();
			return;
		}

		if (typeof navigation.canGoBack === "function" && navigation.canGoBack()) {
			navigation.goBack();
			return;
		}

		router.replace("/activity");
	};

	return (
		<View style={styles.headerContainer}>
			<Pressable
				style={styles.returnContainer}
				onPress={handlePress}>
				<Image source={Chevron} style={{ width: 14, height: 14 }} />
				<Text style={styles.returnText}>Retour</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	headerContainer: {
		marginTop: 60,
		marginBottom: 30,
	},
	returnContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	returnText: {
		marginLeft: 6,
		fontSize: FontSize12,
		fontWeight: "bold",
	},
});
