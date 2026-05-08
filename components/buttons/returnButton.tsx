import Chevron from "@/assets/imgs/icons/chevron.png";
import { FontSize12 } from "@/constants/fontsizes";
import { useNavigation, useRouter } from "expo-router";
import {
	Image,
	Pressable,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	View,
	ViewStyle,
} from "react-native";

export default function ReturnButton({
	destination,
	variant = "inline",
	containerStyle,
	buttonStyle,
	textStyle,
}: {
	destination?: string | null;
	variant?: "inline" | "floating";
	containerStyle?: StyleProp<ViewStyle>;
	buttonStyle?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
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
		<View
			style={[
				styles.headerContainer,
				variant === "floating" && styles.headerContainerFloating,
				containerStyle,
			]}>
			<Pressable
				style={[
					styles.returnContainer,
					variant === "floating" && styles.returnContainerFloating,
					buttonStyle,
				]}
				onPress={handlePress}>
				<View
					style={[
						styles.iconWrap,
						variant === "floating" && styles.iconWrapFloating,
					]}>
					<Image
						source={Chevron}
						style={[
							styles.icon,
							variant === "floating" && styles.iconFloating,
						]}
					/>
				</View>
				<Text
					style={[
						styles.returnText,
						variant === "floating" && styles.returnTextFloating,
						textStyle,
					]}>
					Retour
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	headerContainer: {
		marginTop: 60,
		marginBottom: 30,
	},
	headerContainerFloating: {
		marginTop: 0,
		marginBottom: 0,
	},
	returnContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	returnContainerFloating: {
		backgroundColor: "#FFF",
		borderRadius: 999,
		paddingLeft: 10,
		paddingRight: 18,
		paddingVertical: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 14 },
		shadowOpacity: 0.16,
		shadowRadius: 24,
		elevation: 10,
	},
	iconWrap: {
		alignItems: "center",
		justifyContent: "center",
	},
	iconWrapFloating: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: "#272727",
		marginRight: 10,
	},
	icon: {
		width: 14,
		height: 14,
	},
	iconFloating: {
		tintColor: "#FFF",
	},
	returnText: {
		marginLeft: 6,
		fontSize: FontSize12,
		fontWeight: "bold",
	},
	returnTextFloating: {
		marginLeft: 0,
		fontWeight: "800",
	},
});
